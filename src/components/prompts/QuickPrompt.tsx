import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { Task } from "@/types";

interface QuickPromptProps {
  selectedTask?: Task;
  onSavePrompt: (promptText: string, response: string, taskId?: string) => void;
}

export const QuickPrompt = ({ selectedTask, onSavePrompt }: QuickPromptProps) => {
  const [promptText, setPromptText] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendToChatGPT = async () => {
    if (!promptText.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API call to ChatGPT
    setTimeout(() => {
      const mockResponse = "This is a simulated ChatGPT response. In a real implementation, this would be the actual response from the ChatGPT API.";
      setResponse(mockResponse);
      setIsLoading(false);
    }, 2000);
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
            Quick Prompt
          </CardTitle>
          {selectedTask && (
            <Badge variant="outline">
              Linked to: {selectedTask.title}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Enter your prompt for ChatGPT..."
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <Button 
            onClick={handleSendToChatGPT}
            disabled={!promptText.trim() || isLoading}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send to ChatGPT'}
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