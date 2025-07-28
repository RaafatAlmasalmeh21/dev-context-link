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

    const { taskId, userId, suggestionType } = await req.json();

    if (!taskId || !userId || !suggestionType) {
      throw new Error('taskId, userId, and suggestionType are required');
    }

    console.log('Processing AI task assistant request:', { taskId, suggestionType, userId });

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

    // Get task details
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();

    if (taskError || !task) {
      throw new Error('Task not found or access denied');
    }

    // Build AI prompt based on suggestion type
    let systemPrompt = '';
    let userPrompt = '';

    switch (suggestionType) {
      case 'breakdown':
        systemPrompt = 'You are an expert project manager. Break down complex tasks into smaller, manageable subtasks. Return a JSON object with an array of subtasks, each having title, description, priority, and estimated_hours.';
        userPrompt = `Break down this task: "${task.title}"\nDescription: ${task.description || 'No description'}\nType: ${task.type}\nPriority: ${task.priority}`;
        break;
      
      case 'priority':
        systemPrompt = 'You are an expert in task prioritization. Analyze tasks and suggest appropriate priority levels with reasoning. Return a JSON object with suggested_priority and reasoning.';
        userPrompt = `Analyze the priority for this task: "${task.title}"\nDescription: ${task.description || 'No description'}\nType: ${task.type}\nCurrent priority: ${task.priority}\nDue date: ${task.due_date || 'Not set'}`;
        break;
      
      case 'subtasks':
        systemPrompt = 'You are a development expert. Create detailed subtasks for development work. Return a JSON object with an array of subtasks including technical considerations.';
        userPrompt = `Create subtasks for: "${task.title}"\nDescription: ${task.description || 'No description'}\nType: ${task.type}`;
        break;
      
      case 'context':
        systemPrompt = 'You are a context analysis expert. Provide additional context, considerations, and insights for tasks. Return a JSON object with context_insights, potential_blockers, and suggestions.';
        userPrompt = `Provide context analysis for: "${task.title}"\nDescription: ${task.description || 'No description'}\nType: ${task.type}\nPriority: ${task.priority}`;
        break;
      
      default:
        throw new Error('Invalid suggestion type');
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse AI response as JSON
    let suggestionData;
    try {
      suggestionData = JSON.parse(aiResponse);
    } catch (e) {
      // If parsing fails, wrap in a general structure
      suggestionData = { raw_response: aiResponse };
    }

    // Calculate confidence score based on response quality
    const confidenceScore = Math.min(0.95, Math.max(0.5, 
      (aiResponse.length / 500) * 0.8 + 0.2
    ));

    console.log('AI suggestion generated:', { suggestionType, confidenceScore });

    // Save suggestion to database
    const { data: savedSuggestion, error: saveError } = await supabase
      .from('ai_task_suggestions')
      .insert({
        user_id: userId,
        task_id: taskId,
        suggestion_type: suggestionType,
        suggestion_data: suggestionData,
        confidence_score: confidenceScore
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving suggestion:', saveError);
    }

    return new Response(JSON.stringify({
      suggestion: suggestionData,
      confidence_score: confidenceScore,
      suggestion_id: savedSuggestion?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-task-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});