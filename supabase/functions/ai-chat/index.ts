import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { prompt, taskId, templateId, context, userId } = await req.json();

    if (!prompt || !userId) {
      throw new Error('Prompt and userId are required');
    }

    console.log('Processing AI chat request:', { prompt: prompt.substring(0, 100), taskId, userId });

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build context-aware prompt
    let fullPrompt = prompt;
    let contextData = context || {};

    // If linked to a task, get task context
    if (taskId) {
      const { data: task } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .eq('user_id', userId)
        .single();

      if (task) {
        contextData.task = task;
        fullPrompt = `Context: Working on task "${task.title}" (${task.type}, priority: ${task.priority})\nTask description: ${task.description || 'No description'}\n\nUser prompt: ${prompt}`;
      }
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant specialized in helping developers with their daily tasks, code reviews, and project management. Provide clear, actionable advice and suggestions.'
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;
    const tokensUsed = data.usage?.total_tokens || 0;

    console.log('AI response generated, tokens used:', tokensUsed);

    // Save prompt and response to database
    const { data: savedPrompt, error: saveError } = await supabase
      .from('prompts')
      .insert({
        user_id: userId,
        title: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
        prompt_text: prompt,
        response_text: responseText,
        task_id: taskId || null,
        template_id: templateId || null,
        context: contextData,
        tokens_used: tokensUsed,
        model_used: 'gpt-4o-mini'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving prompt:', saveError);
    }

    return new Response(JSON.stringify({
      response: responseText,
      tokensUsed,
      promptId: savedPrompt?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
