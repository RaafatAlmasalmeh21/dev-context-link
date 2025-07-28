import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Edit, ExternalLink, Calendar, GitCommit } from "lucide-react";
import { Snippet } from "@/types";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface CodeSnippetCardProps {
  snippet: Snippet;
  onEdit?: () => void;
}

export const CodeSnippetCard = ({ snippet, onEdit }: CodeSnippetCardProps) => {
  const { toast } = useToast();

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'javascript': 'bg-yellow-100 text-yellow-800',
      'typescript': 'bg-blue-100 text-blue-800',
      'python': 'bg-green-100 text-green-800',
      'java': 'bg-red-100 text-red-800',
      'cpp': 'bg-purple-100 text-purple-800',
      'csharp': 'bg-indigo-100 text-indigo-800',
      'php': 'bg-violet-100 text-violet-800',
      'ruby': 'bg-pink-100 text-pink-800',
      'go': 'bg-cyan-100 text-cyan-800',
      'rust': 'bg-orange-100 text-orange-800',
    };
    
    const ext = snippet.file_path.split('.').pop()?.toLowerCase();
    const langKey = ext || '';
    return colors[langKey] || 'bg-gray-100 text-gray-800';
  };

  const getFileExtension = () => {
    return snippet.file_path.split('.').pop()?.toUpperCase() || 'CODE';
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code_text);
      toast({
        title: "Copied!",
        description: "Code snippet copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy code to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleViewFile = () => {
    // If it's a GitHub file path with commit SHA, construct GitHub URL
    if (snippet.commit_sha && snippet.file_path.startsWith('src/')) {
      // This would need to be configured with actual repo URL
      console.log('View on GitHub:', snippet.file_path, snippet.commit_sha);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getLanguageColor('')}>
                {getFileExtension()}
              </Badge>
              {snippet.commit_sha && (
                <Badge variant="outline" className="text-xs">
                  <GitCommit className="h-3 w-3 mr-1" />
                  {snippet.commit_sha.substring(0, 7)}
                </Badge>
              )}
            </div>
            <h3 className="font-medium text-sm truncate" title={snippet.file_path}>
              {snippet.file_path}
            </h3>
          </div>
          
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
            {onEdit && (
              <Button size="sm" variant="ghost" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {snippet.commit_sha && (
              <Button size="sm" variant="ghost" onClick={handleViewFile}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="bg-muted p-3 rounded-md">
            <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
              <code className="text-foreground">
                {snippet.code_text.length > 200 
                  ? snippet.code_text.substring(0, 200) + '...'
                  : snippet.code_text
                }
              </code>
            </pre>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {format(snippet.created_at, 'MMM d, yyyy')}
            </div>
            
            <div className="text-xs">
              {snippet.code_text.split('\n').length} lines
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};