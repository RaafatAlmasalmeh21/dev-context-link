import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Snippet } from '@/types';

export interface CodeSnippetFilters {
  search?: string;
  language?: string;
  projectId?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  isFavorite?: boolean;
}

export interface CodeSnippetSortOptions {
  field: 'created_at' | 'file_path' | 'language';
  order: 'asc' | 'desc';
}

export const useCodeSnippets = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<CodeSnippetFilters>({});
  const [sortOptions, setSortOptions] = useState<CodeSnippetSortOptions>({
    field: 'created_at',
    order: 'desc'
  });
  const { toast } = useToast();

  const fetchSnippets = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('code_snippets')
        .select('*');

      // Apply filters
      if (filters.search) {
        query = query.or(`file_path.ilike.%${filters.search}%,code_text.ilike.%${filters.search}%`);
      }

      if (filters.projectId) {
        query = query.eq('task_id', filters.projectId);
      }

      // Apply sorting
      query = query.order(sortOptions.field, { ascending: sortOptions.order === 'asc' });

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const typedSnippets = data.map(snippet => ({
          ...snippet,
          created_at: new Date(snippet.created_at),
        }));
        setSnippets(typedSnippets);
      }
    } catch (error) {
      console.error('Error fetching snippets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch code snippets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSnippet = async (snippetData: Partial<Snippet>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const dbSnippetData = {
        file_path: snippetData.file_path!,
        code_text: snippetData.code_text!,
        commit_sha: snippetData.commit_sha,
        task_id: snippetData.task_id,
        user_id: user.id,
      };

      if (snippetData.id && snippets.find(s => s.id === snippetData.id)) {
        // Update existing snippet
        const { error } = await supabase
          .from('code_snippets')
          .update(dbSnippetData)
          .eq('id', snippetData.id);

        if (error) throw error;
        
        // Optimistic update
        setSnippets(prev => prev.map(s => 
          s.id === snippetData.id 
            ? { ...s, ...snippetData }
            : s
        ));
        
        toast({
          title: "Snippet updated",
          description: "Your code snippet has been updated.",
        });
      } else {
        // Create new snippet
        const { data, error } = await supabase
          .from('code_snippets')
          .insert(dbSnippetData)
          .select()
          .single();

        if (error) throw error;
        
        if (data) {
          const newSnippet = {
            ...data,
            created_at: new Date(data.created_at),
          };
          setSnippets(prev => [newSnippet, ...prev]);
          toast({
            title: "Snippet saved",
            description: "Your code snippet has been saved.",
          });
        }
      }
    } catch (error) {
      console.error('Error saving snippet:', error);
      toast({
        title: "Error",
        description: "Failed to save snippet",
        variant: "destructive",
      });
    }
  };

  const deleteSnippet = async (snippetId: string) => {
    try {
      const { error } = await supabase
        .from('code_snippets')
        .delete()
        .eq('id', snippetId);

      if (error) throw error;

      setSnippets(prev => prev.filter(s => s.id !== snippetId));
      toast({
        title: "Snippet deleted",
        description: "Code snippet has been removed.",
      });
    } catch (error) {
      console.error('Error deleting snippet:', error);
      toast({
        title: "Error",
        description: "Failed to delete snippet",
        variant: "destructive",
      });
    }
  };

  const getLanguageFromPath = (filePath: string): string => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'JavaScript',
      'ts': 'TypeScript',
      'tsx': 'TypeScript React',
      'jsx': 'JavaScript React',
      'py': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'cs': 'C#',
      'php': 'PHP',
      'rb': 'Ruby',
      'go': 'Go',
      'rs': 'Rust',
      'kt': 'Kotlin',
      'swift': 'Swift',
      'css': 'CSS',
      'scss': 'SCSS',
      'html': 'HTML',
      'xml': 'XML',
      'json': 'JSON',
      'yml': 'YAML',
      'yaml': 'YAML',
      'md': 'Markdown',
      'sql': 'SQL',
      'sh': 'Shell',
      'bash': 'Bash',
    };
    return languageMap[extension || ''] || 'Text';
  };

  const filteredSnippets = snippets.filter(snippet => {
    const language = getLanguageFromPath(snippet.file_path);
    
    if (filters.language && language !== filters.language) return false;
    if (filters.dateFrom && snippet.created_at < filters.dateFrom) return false;
    if (filters.dateTo && snippet.created_at > filters.dateTo) return false;
    
    return true;
  });

  useEffect(() => {
    fetchSnippets();
  }, [filters, sortOptions]);

  return {
    snippets: filteredSnippets,
    isLoading,
    filters,
    sortOptions,
    setFilters,
    setSortOptions,
    saveSnippet,
    deleteSnippet,
    refreshSnippets: fetchSnippets,
    getLanguageFromPath,
  };
};