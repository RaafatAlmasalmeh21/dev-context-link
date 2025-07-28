import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, timeRange = '30_days' } = await req.json();

    if (!userId) {
      throw new Error('userId is required');
    }

    console.log('Generating productivity insights for user:', userId);

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization')!
        }
      }
    });

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7_days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30_days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90_days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Fetch analytics data
    const { data: analytics } = await supabase
      .from('task_analytics')
      .select(`
        *,
        tasks(title, type, priority, status)
      `)
      .eq('user_id', userId)
      .gte('completion_date', startDate.toISOString())
      .lte('completion_date', endDate.toISOString())
      .order('completion_date', { ascending: true });

    // Fetch recent tasks for additional context
    const { data: allTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    // Calculate metrics
    const completedTasks = analytics?.filter(a => a.completion_date) || [];
    const totalTasks = allTasks?.length || 0;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
    
    const avgEfficiency = completedTasks.length > 0 
      ? completedTasks.reduce((acc, t) => acc + (t.efficiency_score || 1), 0) / completedTasks.length 
      : 1;

    const totalEstimatedHours = completedTasks.reduce((acc, t) => acc + (t.estimated_hours || 0), 0);
    const totalActualHours = completedTasks.reduce((acc, t) => acc + (t.actual_hours || 0), 0);

    // Prepare data for AI analysis
    const metricsData = {
      timeRange,
      totalTasks,
      completedTasks: completedTasks.length,
      completionRate: Math.round(completionRate),
      avgEfficiency: Math.round(avgEfficiency * 100) / 100,
      totalEstimatedHours: Math.round(totalEstimatedHours * 10) / 10,
      totalActualHours: Math.round(totalActualHours * 10) / 10,
      tasksByType: allTasks?.reduce((acc, task) => {
        acc[task.type] = (acc[task.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      tasksByPriority: allTasks?.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {}
    };

    // Generate AI insights
    const systemPrompt = `You are a productivity analysis expert. Analyze user productivity data and generate actionable insights. Return a JSON object with:
{
  "efficiency_trend": "improving|declining|stable",
  "peak_productivity_patterns": "description of when user is most productive",
  "bottlenecks": ["list of identified bottlenecks"],
  "recommendations": ["specific actionable recommendations"],
  "goal_suggestions": [{"type": "goal_type", "target": number, "reason": "why this goal"}],
  "insights_summary": "brief overall summary"
}`;

    const userPrompt = `Analyze this productivity data:
${JSON.stringify(metricsData, null, 2)}

Recent completion patterns:
${completedTasks.slice(-10).map(t => 
  `- ${t.tasks?.title || 'Task'} (${t.tasks?.type}): estimated ${t.estimated_hours}h, actual ${t.actual_hours}h, efficiency ${t.efficiency_score}`
).join('\n')}

Provide insights on productivity trends, efficiency patterns, and actionable recommendations for improvement.`;

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
        temperature: 0.4,
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

    let insights;
    try {
      insights = JSON.parse(aiResponse);
    } catch (e) {
      insights = { 
        insights_summary: aiResponse,
        recommendations: ["Review task estimation accuracy", "Track time more consistently"],
        error: 'Failed to parse structured insights'
      };
    }

    // Save insights to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Insights expire in 7 days

    const insightTypes = ['efficiency_trend', 'peak_hours', 'task_patterns', 'recommendations'];
    
    for (const insightType of insightTypes) {
      if (insights[insightType]) {
        await supabase
          .from('productivity_insights')
          .insert({
            user_id: userId,
            insight_type: insightType,
            insight_data: { [insightType]: insights[insightType] },
            confidence_score: 0.8,
            expires_at: expiresAt.toISOString()
          });
      }
    }

    console.log('Productivity insights generated successfully');

    return new Response(JSON.stringify({
      metrics: metricsData,
      insights,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in productivity-insights function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});