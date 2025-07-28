import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, GitBranch, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImportStatus {
  step: string;
  progress: number;
  details: string[];
  isComplete: boolean;
  error?: string;
}

interface GitHubRepoImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: (data: {
    files: any[];
    issues: any[];
    metadata: any;
  }) => void;
  githubToken?: string;
}

export const GitHubRepoImport = ({ 
  open, 
  onOpenChange, 
  onImportComplete,
  githubToken 
}: GitHubRepoImportProps) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const parseGitHubUrl = (url: string) => {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) throw new Error("Invalid GitHub URL");
    
    const owner = match[1];
    const repo = match[2].replace(/\.git$/, "");
    return { owner, repo };
  };

  const fetchWithAuth = async (url: string) => {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'DevWorkflow-App'
    };
    
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("GitHub token is invalid or expired");
      }
      if (response.status === 403) {
        throw new Error("API rate limit exceeded or access denied");
      }
      if (response.status === 404) {
        throw new Error("Repository not found or is private");
      }
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    
    return response.json();
  };

  const fetchRepositoryContents = async (owner: string, repo: string, path = "") => {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    return fetchWithAuth(url);
  };

  const fetchFileContent = async (owner: string, repo: string, path: string) => {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const data = await fetchWithAuth(url);
    
    if (data.content && data.encoding === 'base64') {
      return atob(data.content);
    }
    return null;
  };

  const fetchIssues = async (owner: string, repo: string) => {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100`;
    return fetchWithAuth(url);
  };

  const fetchRepoMetadata = async (owner: string, repo: string) => {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    return fetchWithAuth(url);
  };

  const getAllFiles = async (owner: string, repo: string, path = "", allFiles: any[] = []) => {
    const contents = await fetchRepositoryContents(owner, repo, path);
    
    for (const item of contents) {
      if (item.type === 'file') {
        // Only fetch text files (exclude binaries, images, etc.)
        const textExtensions = [
          '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs',
          '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.sh',
          '.html', '.css', '.scss', '.sass', '.less', '.sql', '.json',
          '.xml', '.yaml', '.yml', '.md', '.txt', '.env', '.config',
          '.dockerfile', '.gitignore', '.gitattributes'
        ];
        
        const hasTextExtension = textExtensions.some(ext => 
          item.name.toLowerCase().endsWith(ext)
        );
        
        if (hasTextExtension && item.size < 1000000) { // Skip files larger than 1MB
          try {
            const content = await fetchFileContent(owner, repo, item.path);
            if (content) {
              allFiles.push({
                ...item,
                content,
                language: getLanguageFromExtension(item.name)
              });
            }
          } catch (error) {
            console.warn(`Failed to fetch content for ${item.path}:`, error);
          }
        }
      } else if (item.type === 'dir' && !item.name.startsWith('.') && item.name !== 'node_modules') {
        // Recursively fetch directory contents (excluding hidden dirs and node_modules)
        await getAllFiles(owner, repo, item.path, allFiles);
      }
    }
    
    return allFiles;
  };

  const getLanguageFromExtension = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
      'py': 'python', 'java': 'java', 'cpp': 'cpp', 'c': 'c', 'cs': 'csharp',
      'php': 'php', 'rb': 'ruby', 'go': 'go', 'rs': 'rust', 'swift': 'swift',
      'kt': 'kotlin', 'scala': 'scala', 'sh': 'bash', 'sql': 'sql',
      'html': 'html', 'css': 'css', 'scss': 'scss', 'json': 'json',
      'xml': 'xml', 'yaml': 'yaml', 'yml': 'yaml', 'md': 'markdown'
    };
    return langMap[ext || ''] || 'text';
  };

  const handleImport = async () => {
    if (!repoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a repository URL",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    setImportStatus({
      step: "Initializing",
      progress: 0,
      details: [],
      isComplete: false
    });

    try {
      const { owner, repo } = parseGitHubUrl(repoUrl);
      
      // Step 1: Fetch repository metadata
      setImportStatus(prev => ({
        ...prev!,
        step: "Fetching repository metadata",
        progress: 10,
        details: [`Accessing ${owner}/${repo}`]
      }));
      
      const metadata = await fetchRepoMetadata(owner, repo);
      
      // Step 2: Fetch repository files
      setImportStatus(prev => ({
        ...prev!,
        step: "Scanning repository files",
        progress: 25,
        details: [...prev!.details, `Found repository: ${metadata.full_name}`]
      }));
      
      const files = await getAllFiles(owner, repo);
      
      setImportStatus(prev => ({
        ...prev!,
        step: "Processing files",
        progress: 60,
        details: [...prev!.details, `Found ${files.length} source files`]
      }));
      
      // Step 3: Fetch issues (if available)
      let issues: any[] = [];
      try {
        setImportStatus(prev => ({
          ...prev!,
          step: "Fetching issues and tasks",
          progress: 80,
          details: [...prev!.details, "Loading repository issues..."]
        }));
        
        issues = await fetchIssues(owner, repo);
      } catch (error) {
        console.warn("Could not fetch issues:", error);
      }
      
      // Step 4: Complete import
      setImportStatus(prev => ({
        ...prev!,
        step: "Import complete",
        progress: 100,
        details: [
          ...prev!.details, 
          `Imported ${files.length} files`,
          `Found ${issues.length} issues`,
          "Ready to create project"
        ],
        isComplete: true
      }));
      
      // Call completion handler
      onImportComplete({
        files,
        issues,
        metadata
      });
      
      toast({
        title: "Import Successful",
        description: `Imported ${files.length} files and ${issues.length} issues from ${metadata.full_name}`,
      });
      
    } catch (error: any) {
      console.error("Import error:", error);
      setImportStatus(prev => ({
        ...prev!,
        step: "Import failed",
        progress: 0,
        details: [],
        isComplete: false,
        error: error.message
      }));
      
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    if (!isImporting) {
      onOpenChange(false);
      setImportStatus(null);
      setRepoUrl("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Import GitHub Repository
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!importStatus && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repo-url">Repository URL</Label>
                <Input
                  id="repo-url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  disabled={isImporting}
                />
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">What will be imported:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Source code files (JS, TS, Python, etc.)</li>
                  <li>• Repository metadata and description</li>
                  <li>• Issues as tasks (if accessible)</li>
                  <li>• README and documentation files</li>
                </ul>
              </div>
              
              {!githubToken && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">No GitHub Token</p>
                      <p className="text-yellow-700">
                        Without a GitHub token, you'll have limited API access and can only access public repositories.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {importStatus && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{importStatus.step}</span>
                  {importStatus.isComplete && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  )}
                  {importStatus.error && (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                </div>
                <Progress value={importStatus.progress} className="h-2" />
              </div>
              
              <ScrollArea className="h-32 border rounded-lg p-3">
                {importStatus.details.map((detail, index) => (
                  <div key={index} className="text-sm text-muted-foreground mb-1">
                    {detail}
                  </div>
                ))}
                {importStatus.error && (
                  <div className="text-sm text-destructive mt-2">
                    Error: {importStatus.error}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isImporting}
            >
              {importStatus?.isComplete ? "Close" : "Cancel"}
            </Button>
            {!importStatus && (
              <Button onClick={handleImport} disabled={isImporting}>
                <Download className="h-4 w-4 mr-2" />
                Import Repository
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};