import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { ReviewDialog } from "@/components/reviews/ReviewDialog";
import { QuickPrompt } from "@/components/prompts/QuickPrompt";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Task, TaskStatus, Prompt, Review, ReviewStatus } from "@/types";
import { Plus, Calendar, Target, Zap, GitPullRequest, Code2, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const Dashboard = () => {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState('today');
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Implement user authentication',
      description: 'Set up login/logout functionality with JWT tokens',
      type: 'code',
      status: 'doing',
      priority: 'high',
      due_date: new Date('2025-01-28'),
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: '2',
      title: 'Review PR #123',
      description: 'Check the new dashboard component implementation',
      type: 'review',
      status: 'todo',
      priority: 'med',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: '3',
      title: 'Write API documentation',
      description: 'Document all endpoints for the user management API',
      type: 'doc',
      status: 'review',
      priority: 'med',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
  
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [editingReview, setEditingReview] = useState<Review | undefined>();
  const [initialStatus, setInitialStatus] = useState<TaskStatus>('todo');
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [githubToken, setGithubToken] = useState<string>('');
  const [githubConnected, setGithubConnected] = useState(false);
  const [showGithubDialog, setShowGithubDialog] = useState(false);

  // Check for existing GitHub token on mount
  useEffect(() => {
    const token = localStorage.getItem('github_token');
    if (token) {
      setGithubToken(token);
      setGithubConnected(true);
    }
  }, []);

  const handleTaskSave = (taskData: Partial<Task>) => {
    if (taskData.id) {
      // Update existing task
      setTasks(prev => prev.map(t => 
        t.id === taskData.id 
          ? { ...t, ...taskData, updated_at: new Date() }
          : t
      ));
      toast({
        title: "Task updated",
        description: "Your task has been successfully updated.",
      });
    } else {
      // Create new task
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskData.title!,
        description: taskData.description!,
        type: taskData.type!,
        status: taskData.status!,
        priority: taskData.priority!,
        due_date: taskData.due_date,
        created_at: new Date(),
        updated_at: new Date(),
      };
      setTasks(prev => [...prev, newTask]);
      toast({
        title: "Task created",
        description: "Your new task has been added to the board.",
      });
    }
  };

  const handleAddTask = (status: TaskStatus) => {
    setEditingTask(undefined);
    setInitialStatus(status);
    setTaskDialogOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleSavePrompt = (promptText: string, response: string, taskId?: string) => {
    const newPrompt: Prompt = {
      id: Date.now().toString(),
      prompt_text: promptText,
      response_snippet: response,
      created_at: new Date(),
      task_id: taskId || null,
      tags: ['general']
    };
    
    setPrompts(prev => [newPrompt, ...prev]);
    toast({
      title: "Prompt saved",
      description: "Your prompt and response have been saved.",
    });
  };

  const handleGithubConnect = async () => {
    if (!githubToken.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid GitHub token.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Test the GitHub token by making a request to the GitHub API
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('github_token', githubToken);
        setGithubConnected(true);
        setShowGithubDialog(false);
        toast({
          title: "GitHub Connected",
          description: `Successfully connected as ${userData.login}`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Invalid GitHub token. Please check your token and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to connect to GitHub. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddReview = () => {
    setEditingReview(undefined);
    setReviewDialogOpen(true);
  };

  const handleReviewClick = (review: Review) => {
    setEditingReview(review);
    setReviewDialogOpen(true);
  };

  const handleReviewSave = (reviewData: Partial<Review>) => {
    if (reviewData.id) {
      // Update existing review
      setReviews(prev => prev.map(r => 
        r.id === reviewData.id 
          ? { ...r, ...reviewData, updated_at: new Date() }
          : r
      ));
      toast({
        title: "Review updated",
        description: "Your review has been successfully updated.",
      });
    } else {
      // Create new review
      const newReview: Review = {
        id: Date.now().toString(),
        pr_url: reviewData.pr_url!,
        notes: reviewData.notes!,
        status: reviewData.status!,
        reviewer: reviewData.reviewer!,
        task_id: reviewData.task_id,
        created_at: new Date(),
        updated_at: new Date(),
      };
      setReviews(prev => [...prev, newReview]);
      toast({
        title: "Review added",
        description: "Your new review has been added.",
      });
    }
  };

  const handleGithubDisconnect = () => {
    localStorage.removeItem('github_token');
    setGithubToken('');
    setGithubConnected(false);
    toast({
      title: "GitHub Disconnected",
      description: "Your GitHub connection has been removed.",
    });
  };

  const todayTasks = tasks.filter(task => {
    if (task.due_date) {
      const today = new Date();
      const dueDate = new Date(task.due_date);
      return dueDate.toDateString() === today.toDateString();
    }
    return task.status === 'doing' || task.status === 'todo';
  });

  const renderTodayView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Today's Focus</h2>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <Button onClick={() => handleAddTask('todo')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Tasks</p>
                <p className="text-2xl font-bold">{todayTasks.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">
                  {tasks.filter(t => t.status === 'doing').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prompts Saved</p>
                <p className="text-2xl font-bold">{prompts.length}</p>
              </div>
              <Zap className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <KanbanBoard 
            tasks={todayTasks}
            onTaskClick={handleTaskClick}
            onAddTask={handleAddTask}
          />
        </div>
        <div>
          <QuickPrompt 
            selectedTask={selectedTask}
            onSavePrompt={handleSavePrompt}
          />
        </div>
      </div>
    </div>
  );

  const renderAllTasksView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">All Tasks</h2>
        <Button onClick={() => handleAddTask('todo')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
      <KanbanBoard 
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onAddTask={handleAddTask}
      />
    </div>
  );

  const renderPromptsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Saved Prompts</h2>
        <Button onClick={() => setActiveView('today')}>
          Back to Today
        </Button>
      </div>
      
      <div className="grid gap-4">
        {prompts.map((prompt) => (
          <Card key={prompt.id} className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {prompt.tags?.[0] || 'General'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(prompt.created_at), 'MMM d, yyyy')}
                </span>
              </div>
              <p className="font-medium">{prompt.prompt_text}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {prompt.response_snippet}
              </p>
            </div>
          </Card>
        ))}
        
        {prompts.length === 0 && (
          <Card className="p-8 text-center">
            <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No prompts saved yet</h3>
            <p className="text-muted-foreground">
              Save prompts from the Today view to see them here.
            </p>
          </Card>
        )}
      </div>
    </div>
  );

  const renderReviewsView = () => {
    // Use real reviews data with fallback to mock data for demo
    const allReviews = reviews.length > 0 ? reviews : [
      {
        id: "1",
        pr_url: "https://github.com/user/repo/pull/123",
        notes: "Authentication middleware looks good, just a few minor suggestions",
        status: "open" as ReviewStatus,
        reviewer: "john_doe",
        task_id: "1",
        created_at: new Date("2024-01-15"),
        updated_at: new Date("2024-01-15")
      },
      {
        id: "2", 
        pr_url: "https://github.com/user/repo/pull/124",
        notes: "Database connection needs optimization before merge",
        status: "changes-requested" as ReviewStatus,
        reviewer: "jane_smith",
        task_id: undefined,
        created_at: new Date("2024-01-14"),
        updated_at: new Date("2024-01-14")
      },
      {
        id: "3",
        pr_url: "https://github.com/user/repo/pull/125", 
        notes: "Documentation update completed successfully",
        status: "merged" as ReviewStatus,
        reviewer: "bob_wilson",
        task_id: "3",
        created_at: new Date("2024-01-13"),
        updated_at: new Date("2024-01-13")
      }
    ];

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'open': return 'text-blue-600 bg-blue-50 border-blue-200';
        case 'changes-requested': return 'text-orange-600 bg-orange-50 border-orange-200';
        case 'merged': return 'text-green-600 bg-green-50 border-green-200';
        default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'open': return <GitPullRequest className="h-4 w-4" />;
        case 'changes-requested': return <Target className="h-4 w-4" />;
        case 'merged': return <Zap className="h-4 w-4" />;
        default: return <GitPullRequest className="h-4 w-4" />;
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Code Reviews</h2>
            <p className="text-muted-foreground">Track GitHub pull request reviews and link them to tasks</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={githubConnected ? handleGithubDisconnect : () => setShowGithubDialog(true)}
            >
              <GitPullRequest className="h-4 w-4 mr-2" />
              {githubConnected ? 'Disconnect GitHub' : 'Sync GitHub'}
            </Button>
            <Button onClick={handleAddReview}>
              <Plus className="h-4 w-4 mr-2" />
              Add Review
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <GitPullRequest className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Open</p>
                  <p className="text-xl font-bold">
                    {allReviews.filter(pr => pr.status === 'open').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Target className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Changes Requested</p>
                  <p className="text-xl font-bold">
                    {allReviews.filter(pr => pr.status === 'changes-requested').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Zap className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Merged</p>
                  <p className="text-xl font-bold">
                    {allReviews.filter(pr => pr.status === 'merged').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-xl font-bold">{allReviews.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Pull Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allReviews.map((review) => (
                <div 
                  key={review.id} 
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleReviewClick(review)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${getStatusColor(review.status)} text-xs`}>
                          {getStatusIcon(review.status)}
                          <span className="ml-1">{review.status.replace('-', ' ')}</span>
                        </Badge>
                        {review.task_id && (
                          <Badge variant="outline" className="text-xs">
                            Linked to Task
                          </Badge>
                        )}
                      </div>
                      
                      <h4 className="font-medium mb-1">
                        {review.pr_url.split('/').pop() || 'Pull Request'}
                      </h4>
                      
                      <p className="text-sm text-muted-foreground mb-2">{review.notes}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>by {review.reviewer}</span>
                        <span>{format(review.created_at, 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        window.open(review.pr_url, '_blank');
                      }}>
                        View PR
                      </Button>
                      <Button variant="ghost" size="sm">
                        Link to Task
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* GitHub Integration Setup */}
        <Card className="border-dashed">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <GitPullRequest className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">
                  {githubConnected ? 'GitHub Connected' : 'Connect GitHub Repository'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {githubConnected 
                    ? 'Your GitHub repository is connected and ready to sync pull requests'
                    : 'Automatically sync pull requests and reviews from your GitHub repository'
                  }
                </p>
              </div>
              <Button 
                onClick={githubConnected ? handleGithubDisconnect : () => setShowGithubDialog(true)}
                variant={githubConnected ? "outline" : "default"}
              >
                {githubConnected ? 'Disconnect' : 'Connect GitHub'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCodeView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Code Snippets</h2>
      </div>
      
      <Card>
        <CardContent className="p-8 text-center">
          <Code2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No code snippets yet</h3>
          <p className="text-muted-foreground">
            Save important code snippets and link them to your tasks.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderProjectsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Projects</h2>
      </div>
      
      <Card>
        <CardContent className="p-8 text-center">
          <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No projects yet</h3>
          <p className="text-muted-foreground">
            Create and organize your development projects here.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'today':
        return renderTodayView();
      case 'tasks':
        return renderAllTasksView();
      case 'prompts':
        return renderPromptsView();
      case 'reviews':
        return renderReviewsView();
      case 'code':
        return renderCodeView();
      case 'projects':
        return renderProjectsView();
      default:
        return renderTodayView();
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeView={activeView} 
          onViewChange={setActiveView} 
        />
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
      
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSave={handleTaskSave}
        task={editingTask}
        initialStatus={initialStatus}
      />
      
      <ReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        onSave={handleReviewSave}
        review={editingReview}
        tasks={tasks}
      />

      {/* GitHub Connection Dialog */}
      <Dialog open={showGithubDialog} onOpenChange={setShowGithubDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect to GitHub</DialogTitle>
            <DialogDescription>
              Enter your GitHub Personal Access Token to connect your repository.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github-token">GitHub Personal Access Token</Label>
              <Input
                id="github-token"
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                You can create a token at{' '}
                <a 
                  href="https://github.com/settings/tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  GitHub Settings → Personal Access Tokens
                </a>
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowGithubDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleGithubConnect}>
                Connect
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};