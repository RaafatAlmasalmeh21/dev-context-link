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
    const { taskData, userId, estimationType } = await req.json();

    if (!taskData || !userId || !estimationType) {
      throw new Error('taskData, userId, and estimationType are required');
    }

    console.log('Processing AI estimation request:', { estimationType, userId });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's historical task data for context
    const { data: historicalTasks } = await supabase
      .from('task_analytics')
      .select(`
        estimated_hours,
        actual_hours,
        efficiency_score,
        complexity_score,
        tasks(title, type, priority)
      `)
      .eq('user_id', userId)
      .limit(20)
      .order('completion_date', { ascending: false });

    let systemPrompt = '';
    let userPrompt = '';

    switch (estimationType) {
      case 'time_estimate':
        systemPrompt = `You are an expert project manager and time estimation specialist. Based on task details and historical data, provide accurate time estimates. Return a JSON object with estimated_hours (decimal), confidence_score (0-1), complexity_score (1-5), and reasoning.`;
        
        userPrompt = `Estimate time for this task:
Title: ${taskData.title}
Description: ${taskData.description || 'No description'}
Type: ${taskData.type}
Priority: ${taskData.priority}

Historical context: ${historicalTasks?.length ? `User has completed ${historicalTasks.length} similar tasks with average efficiency of ${(historicalTasks.reduce((acc, t) => acc + (t.efficiency_score || 1), 0) / historicalTasks.length).toFixed(2)}` : 'No historical data available'}

Consider task complexity, type, and user's historical performance.`;
        break;

      case 'category_suggestion':
        systemPrompt = `You are an expert in task categorization and project management. Analyze tasks and suggest appropriate categories, priorities, and types. Return a JSON object with suggested_type, suggested_priority, tags, and reasoning.`;
        
        userPrompt = `Categorize this task:
Title: ${taskData.title}
Description: ${taskData.description || 'No description'}
Current Type: ${taskData.type || 'Not set'}
Current Priority: ${taskData.priority || 'Not set'}

Suggest better categorization based on content and urgency.`;
        break;

      case 'deadline_prediction':
        systemPrompt = `You are a deadline prediction expert. Based on task complexity, user workload, and historical data, predict realistic deadlines. Return a JSON object with suggested_deadline (ISO string), workload_impact, and reasoning.`;
        
        userPrompt = `Predict deadline for this task:
Title: ${taskData.title}
Description: ${taskData.description || 'No description'}
Type: ${taskData.type}
Priority: ${taskData.priority}
Estimated Hours: ${taskData.estimated_hours || 'Not estimated'}

Current workload context: ${historicalTasks?.length ? `User typically handles ${Math.ceil(historicalTasks.length / 4)} tasks per week` : 'No workload history available'}`;
        break;

      default:
        throw new Error('Invalid estimation type');
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
        max_tokens: 1000,
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
    let estimationData;
    try {
      estimationData = JSON.parse(aiResponse);
    } catch (e) {
      estimationData = { raw_response: aiResponse, error: 'Failed to parse JSON' };
    }

    console.log('AI estimation generated:', { estimationType, estimationData });

    return new Response(JSON.stringify({
      estimation: estimationData,
      type: estimationType,
      historical_context: historicalTasks?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-task-estimator function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});