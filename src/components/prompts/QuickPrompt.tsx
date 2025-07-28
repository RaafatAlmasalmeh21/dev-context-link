import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Sparkles, FileText, Wand2 } from "lucide-react";
import { useState } from "react";
import { Task } from "@/types";
import { useAI } from "@/hooks/useAI";
import { usePrompts } from "@/hooks/usePrompts";

interface QuickPromptProps {
  selectedTask?: Task;
  onSavePrompt: (promptText: string, response: string, taskId?: string) => void;
}

export const QuickPrompt = ({ selectedTask, onSavePrompt }: QuickPromptProps) => {
  const [promptText, setPromptText] = useState('');
  const [response, setResponse] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const { sendChatPrompt, getTaskSuggestion, isLoading } = useAI();
  const { templates, useTemplate } = usePrompts();

  const handleSendToAI = async () => {
    if (!promptText.trim()) return;
    
    const result = await sendChatPrompt(
      promptText, 
      selectedTask?.id, 
      selectedTemplate || undefined,
      selectedTask ? { task: selectedTask } : undefined
    );
    
    if (result) {
      setResponse(result.response);
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setPromptText(template.template_text);
      setSelectedTemplate(templateId);
      await useTemplate(templateId);
    }
  };

  const handleGetAISuggestions = async () => {
    if (!selectedTask) return;
    
    const suggestion = await getTaskSuggestion(selectedTask.id, 'breakdown');
    if (suggestion) {
      const suggestionText = `AI suggests breaking down "${selectedTask.title}" into:\n\n${JSON.stringify(suggestion.suggestion, null, 2)}`;
      setResponse(suggestionText);
    }
  };

  const handleSavePrompt = () => {
    if (!promptText.trim() || !response.trim()) return;
    
    onSavePrompt(promptText, response, selectedTask?.id);
    setPromptText('');
    setResponse('');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Assistant
          </CardTitle>
          <div className="flex gap-2">
            {selectedTask && (
              <Badge variant="outline" className="flex items-center gap-1">
                <span>🎯</span> {selectedTask.title}
              </Badge>
            )}
            {selectedTemplate && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Template
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Prompt Templates</label>
          <Select value={selectedTemplate} onValueChange={handleUseTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a template..." />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{template.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* AI Suggestions for Tasks */}
        {selectedTask && (
          <div className="flex gap-2">
            <Button 
              onClick={handleGetAISuggestions}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Break Down Task
            </Button>
          </div>
        )}

        {/* Prompt Input */}
        <div className="space-y-2">
          <Textarea
            placeholder="Enter your prompt for AI assistance..."
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <Button 
            onClick={handleSendToAI}
            disabled={!promptText.trim() || isLoading}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Processing...' : 'Send to AI'}
          </Button>
        </div>

        {response && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Response:</label>
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <Button 
              onClick={handleSavePrompt}
              variant="outline"
              className="w-full"
            >
              Save Prompt & Response
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};