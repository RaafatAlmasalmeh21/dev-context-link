import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Prompt {
  id: string;
  title: string;
  prompt_text: string;
  response_text?: string;
  task_id?: string;
  template_id?: string;
  context?: any;
  tokens_used: number;
  model_used: string;
  created_at: string;
  updated_at: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  template_text: string;
  category: string;
  variables: any;
  is_public: boolean;
  usage_count: number;
  created_at: string;
}

export const usePrompts = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchPrompts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch prompts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('prompt_templates')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const createTemplate = async (template: Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('prompt_templates')
        .insert({
          ...template,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Template Created",
        description: `Template "${template.name}" has been saved`,
      });

      await fetchTemplates();
      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
      return null;
    }
  };

  const useTemplate = async (templateId: string) => {
    try {
      // Get current template and increment usage count
      const { data: template } = await supabase
        .from('prompt_templates')
        .select('usage_count')
        .eq('id', templateId)
        .single();
        
      if (template) {
        const { error } = await supabase
          .from('prompt_templates')
          .update({ usage_count: template.usage_count + 1 })
          .eq('id', templateId);
          
        if (error) throw error;
        await fetchTemplates();
      }
    } catch (error) {
      console.error('Error updating template usage:', error);
    }
  };

  const deletePrompt = async (promptId: string) => {
    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', promptId);

      if (error) throw error;

      toast({
        title: "Prompt Deleted",
        description: "Prompt has been removed",
      });

      await fetchPrompts();
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast({
        title: "Error",
        description: "Failed to delete prompt",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPrompts();
    fetchTemplates();
  }, []);

  return {
    prompts,
    templates,
    isLoading,
    fetchPrompts,
    fetchTemplates,
    createTemplate,
    useTemplate,
    deletePrompt
  };
};