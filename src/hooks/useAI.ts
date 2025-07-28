import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AIResponse {
  response: string;
  tokensUsed: number;
  promptId?: string;
}

export interface TaskSuggestion {
  suggestion: any;
  confidence_score: number;
  suggestion_id?: string;
}

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendChatPrompt = async (
    prompt: string,
    taskId?: string,
    templateId?: string,
    context?: any
  ): Promise<AIResponse | null> => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          prompt,
          taskId,
          templateId,
          context,
          userId: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "AI Response Generated",
        description: `Used ${data.tokensUsed} tokens`,
      });

      return data;
    } catch (error) {
      console.error('AI chat error:', error);
      toast({
        title: "AI Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getTaskSuggestion = async (
    taskId: string,
    suggestionType: 'breakdown' | 'priority' | 'subtasks' | 'context'
  ): Promise<TaskSuggestion | null> => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('ai-task-assistant', {
        body: {
          taskId,
          userId: user.id,
          suggestionType
        }
      });

      if (error) throw error;

      toast({
        title: "AI Suggestion Generated",
        description: `Confidence: ${Math.round(data.confidence_score * 100)}%`,
      });

      return data;
    } catch (error) {
      console.error('AI task suggestion error:', error);
      toast({
        title: "AI Error",
        description: error.message || "Failed to get AI suggestion",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendChatPrompt,
    getTaskSuggestion,
    isLoading
  };
};