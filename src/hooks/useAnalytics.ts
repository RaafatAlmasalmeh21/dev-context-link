import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TaskAnalytics {
  id: string;
  task_id: string;
  estimated_hours?: number;
  actual_hours?: number;
  completion_date?: string;
  efficiency_score?: number;
  complexity_score?: number;
  interruptions_count?: number;
  focus_time_minutes?: number;
}

export interface UserGoal {
  id: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  period_start: string;
  period_end: string;
  status: string;
}

export interface ProductivityMetrics {
  completionRate: number;
  avgEfficiency: number;
  totalHours: number;
  tasksByType: Record<string, number>;
  tasksByPriority: Record<string, number>;
  weeklyTrend: number[];
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<TaskAnalytics[]>([]);
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [metrics, setMetrics] = useState<ProductivityMetrics | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getTaskEstimation = async (
    taskData: any,
    estimationType: 'time_estimate' | 'category_suggestion' | 'deadline_prediction'
  ) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('ai-task-estimator', {
        body: {
          taskData,
          userId: user.id,
          estimationType
        }
      });

      if (error) throw error;

      toast({
        title: "AI Estimation Complete",
        description: `Generated ${estimationType.replace('_', ' ')} suggestion`,
      });

      return data;
    } catch (error) {
      console.error('Task estimation error:', error);
      toast({
        title: "Estimation Error",
        description: error.message || "Failed to get AI estimation",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateProductivityInsights = async (timeRange = '30_days') => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('productivity-insights', {
        body: {
          userId: user.id,
          timeRange
        }
      });

      if (error) throw error;

      setMetrics(data.metrics);
      setInsights(data.insights);

      toast({
        title: "Insights Generated",
        description: "Your productivity analysis is ready",
      });

      return data;
    } catch (error) {
      console.error('Insights generation error:', error);
      toast({
        title: "Insights Error",
        description: error.message || "Failed to generate insights",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const recordTaskCompletion = async (taskId: string, actualHours: number, estimatedHours?: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const efficiencyScore = estimatedHours && actualHours 
        ? Math.min(2, estimatedHours / actualHours) 
        : 1;

      const { error } = await supabase
        .from('task_analytics')
        .insert({
          user_id: user.id,
          task_id: taskId,
          estimated_hours: estimatedHours,
          actual_hours: actualHours,
          completion_date: new Date().toISOString(),
          efficiency_score: efficiencyScore,
          complexity_score: 3 // Default complexity, could be estimated by AI
        });

      if (error) throw error;

      await fetchAnalytics();
      
      toast({
        title: "Task Completed",
        description: `Efficiency: ${Math.round(efficiencyScore * 100)}%`,
      });

    } catch (error) {
      console.error('Error recording task completion:', error);
      toast({
        title: "Error",
        description: "Failed to record task completion",
        variant: "destructive",
      });
    }
  };

  const createGoal = async (goalType: string, targetValue: number, periodDays = 7) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + periodDays);

      const { error } = await supabase
        .from('user_goals')
        .insert({
          user_id: user.id,
          goal_type: goalType,
          target_value: targetValue,
          period_start: startDate.toISOString(),
          period_end: endDate.toISOString()
        });

      if (error) throw error;

      await fetchGoals();

      toast({
        title: "Goal Created",
        description: `${goalType} goal set for ${targetValue}`,
      });

    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('task_analytics')
        .select('*')
        .order('completion_date', { ascending: false });

      if (error) throw error;
      setAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchGoals();
  }, []);

  return {
    analytics,
    goals,
    metrics,
    insights,
    isLoading,
    getTaskEstimation,
    generateProductivityInsights,
    recordTaskCompletion,
    createGoal,
    fetchAnalytics,
    fetchGoals
  };
};