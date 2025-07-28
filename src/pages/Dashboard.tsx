import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { ReviewDialog } from "@/components/reviews/ReviewDialog";
import { ProjectDialog } from "@/components/projects/ProjectDialog";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CodeSnippetDialog } from "@/components/snippets/CodeSnippetDialog";
import { CodeSnippetCard } from "@/components/snippets/CodeSnippetCard";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { QuickPrompt } from "@/components/prompts/QuickPrompt";
import { EnhancedPromptView } from "@/components/prompts/EnhancedPromptView";
import { SmartAnalyticsDashboard } from "@/components/analytics/SmartAnalyticsDashboard";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { GitHubRepoImport } from "@/components/github/GitHubRepoImport";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, TaskStatus, TaskType, Priority, Prompt, Review, ReviewStatus, Project, Snippet } from "@/types";
import { Plus, Calendar, Target, Zap, GitPullRequest, Code2, FolderOpen, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const Dashboard = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // State management
  const [activeView, setActiveView] = useState('today');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Dialog states
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [snippetDialogOpen, setSnippetDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [githubImportOpen, setGithubImportOpen] = useState(false);
  
  // Editing states
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [editingSnippet, setEditingSnippet] = useState<Snippet | undefined>();
  const [editingReview, setEditingReview] = useState<Review | undefined>();
  
  const [initialStatus, setInitialStatus] = useState<TaskStatus>('todo');
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [githubToken, setGithubToken] = useState<string>('');
  const [githubConnected, setGithubConnected] = useState(false);
  const [showGithubDialog, setShowGithubDialog] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [taskFilters, setTaskFilters] = useState<any>({});
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Check auth status and fetch data
  useEffect(() => {
    if (!loading && !user) {
      setAuthDialogOpen(true);
      return;
    }

    if (user) {
      fetchAllData();
    }
  }, [user, loading]);

  // Check for existing GitHub token on mount
  useEffect(() => {
    const token = localStorage.getItem('github_token');
    if (token) {
      setGithubToken(token);
      setGithubConnected(true);
    }
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchTasks(),
      fetchProjects(),
      fetchSnippets()
    ]);
  };

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        const typedTasks = data.map(task => ({
          ...task,
          type: task.type as TaskType,
          status: task.status as TaskStatus,
          priority: task.priority as Priority,
          due_date: task.due_date ? new Date(task.due_date) : undefined,
          created_at: new Date(task.created_at),
          updated_at: new Date(task.updated_at),
        }));
        setTasks(typedTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        const typedProjects = data.map(project => ({
          ...project,
          status: project.status as any,
          created_at: new Date(project.created_at),
          updated_at: new Date(project.updated_at),
        }));
        setProjects(typedProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive",
      });
    }
  };

  const fetchSnippets = async () => {
    try {
      const { data, error } = await supabase
        .from('code_snippets')
        .select('*')
        .order('created_at', { ascending: false });

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
    }
  };

  const handleTaskSave = async (taskData: Partial<Task>) => {
    if (!user) return;

    try {
      const dbTaskData = {
        title: taskData.title!,
        description: taskData.description || '',
        status: taskData.status!,
        priority: taskData.priority!,
        type: taskData.type!,
        due_date: taskData.due_date?.toISOString(),
        estimated_hours: taskData.estimated_hours,
        actual_hours: taskData.actual_hours,
        user_id: user.id,
        project_id: taskData.project_id,
        tags: taskData.tags,
      };

      if (taskData.id && tasks.find(t => t.id === taskData.id)) {
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update(dbTaskData)
          .eq('id', taskData.id);

        if (error) throw error;
        
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
        const { data, error } = await supabase
          .from('tasks')
          .insert(dbTaskData)
          .select()
          .single();

        if (error) throw error;
        
        if (data) {
          const newTask = {
            ...data,
            type: data.type as TaskType,
            status: data.status as TaskStatus,
            priority: data.priority as Priority,
            due_date: data.due_date ? new Date(data.due_date) : undefined,
            created_at: new Date(data.created_at),
            updated_at: new Date(data.updated_at),
          };
          setTasks(prev => [...prev, newTask]);
          toast({
            title: "Task created",
            description: "Your new task has been added to the board.",
          });
        }
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: "Error",
        description: "Failed to save task",
        variant: "destructive",
      });
    }
  };

  const handleProjectSave = async (projectData: Partial<Project>) => {
    if (!user) return;

    try {
      const dbProjectData = {
        name: projectData.name!,
        description: projectData.description || '',
        repo_url: projectData.repo_url,
        status: projectData.status!,
        user_id: user.id,
      };

      if (projectData.id && projects.find(p => p.id === projectData.id)) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update(dbProjectData)
          .eq('id', projectData.id);

        if (error) throw error;
        
        setProjects(prev => prev.map(p => 
          p.id === projectData.id 
            ? { ...p, ...projectData, updated_at: new Date() }
            : p
        ));
        
        toast({
          title: "Project updated",
          description: "Your project has been successfully updated.",
        });
      } else {
        // Create new project
        const { data, error } = await supabase
          .from('projects')
          .insert(dbProjectData)
          .select()
          .single();

        if (error) throw error;
        
        if (data) {
          const newProject = {
            ...data,
            status: data.status as any,
            created_at: new Date(data.created_at),
            updated_at: new Date(data.updated_at),
          };
          setProjects(prev => [...prev, newProject]);
          toast({
            title: "Project created",
            description: "Your new project has been created.",
          });
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    }
  };

  const handleSnippetSave = async (snippetData: Partial<Snippet>) => {
    if (!user) return;

    try {
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
          setSnippets(prev => [...prev, newSnippet]);
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

  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus, updated_at: new Date() }
          : task
      ));

      toast({
        title: "Task updated",
        description: "Task status has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const handleAddTask = (status: TaskStatus) => {
    setInitialStatus(status);
    setEditingTask(undefined);
    setTaskDialogOpen(true);
  };

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !task.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (taskFilters.status && task.status !== taskFilters.status) return false;
    if (taskFilters.type && task.type !== taskFilters.type) return false;
    if (taskFilters.priority && task.priority !== taskFilters.priority) return false;
    if (taskFilters.tags && taskFilters.tags.length > 0) {
      const hasTag = taskFilters.tags.some(tag => task.tags?.includes(tag));
      if (!hasTag) return false;
    }
    
    return true;
  }).sort((a, b) => {
    const aValue = a[sortBy as keyof Task];
    const bValue = b[sortBy as keyof Task];
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const todayTasks = filteredTasks.filter(task => {
    if (task.due_date) {
      const today = new Date();
      const dueDate = new Date(task.due_date);
      return dueDate.toDateString() === today.toDateString();
    }
    return task.status === 'doing' || task.status === 'todo';
  });

  // GitHub handlers
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

  const handleGithubImport = async (importData: { files: any[]; issues: any[]; metadata: any }) => {
    try {
      if (!user) return;

      // Create project from metadata
      const projectData = {
        name: importData.metadata.name,
        description: importData.metadata.description || "",
        repo_url: importData.metadata.clone_url,
        status: "active" as const,
        user_id: user.id,
      };

      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (projectError) throw projectError;

      // Import files as code snippets
      const snippetPromises = importData.files.map(async (file: any) => {
        const snippetData = {
          file_path: file.path,
          code_text: file.content,
          commit_sha: file.sha,
          user_id: user.id,
        };

        return supabase.from('code_snippets').insert(snippetData);
      });

      await Promise.all(snippetPromises);

      // Import issues as tasks
      const taskPromises = importData.issues
        .filter((issue: any) => !issue.pull_request) // Filter out PRs
        .map(async (issue: any) => {
          const taskData = {
            title: issue.title,
            description: issue.body || "",
            status: issue.state === "closed" ? "done" : "todo",
            priority: issue.labels.some((l: any) => l.name.includes("high")) ? "high" : 
                     issue.labels.some((l: any) => l.name.includes("low")) ? "low" : "med",
            type: issue.labels.some((l: any) => l.name.includes("bug")) ? "code" : "prompt",
            project_id: newProject.id,
            user_id: user.id,
            tags: issue.labels.map((l: any) => l.name),
          };

          return supabase.from('tasks').insert(taskData);
        });

      await Promise.all(taskPromises);

      // Refresh data
      await fetchAllData();

      setGithubImportOpen(false);

      toast({
        title: "Repository Imported Successfully",
        description: `Created project "${newProject.name}" with ${importData.files.length} files and ${importData.issues.length} issues`,
      });

    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import repository",
        variant: "destructive",
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

  // Review handlers
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

  // Render methods for different views
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-sm text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Code Snippets</p>
                <p className="text-2xl font-bold">{snippets.length}</p>
              </div>
              <Code2 className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <KanbanBoard 
            tasks={todayTasks}
            onAddTask={handleAddTask}
            onTaskStatusChange={handleTaskStatusChange}
            onTaskClick={handleTaskClick}
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

      <TaskFilters
        tasks={tasks}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedFilters={taskFilters}
        onFilterChange={setTaskFilters}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(sortBy, order) => {
          setSortBy(sortBy);
          setSortOrder(order);
        }}
      />

      <KanbanBoard 
        tasks={filteredTasks} 
        onTaskClick={handleTaskClick}
        onAddTask={handleAddTask}
        onTaskStatusChange={handleTaskStatusChange}
      />
    </div>
  );

  const renderPromptsView = () => (
    <EnhancedPromptView />
  );

  const renderProjectsView = () => (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Projects</h2>
            <p className="text-muted-foreground">Manage your projects and track progress</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setGithubImportOpen(true)}>
              <GitPullRequest className="h-4 w-4 mr-2" />
              Import from GitHub
            </Button>
            <Button onClick={() => setProjectDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const projectTasks = tasks.filter(task => task.project_id === project.id);
          const completedTasks = projectTasks.filter(task => task.status === 'done').length;
          
          return (
            <ProjectCard
              key={project.id}
              project={project}
              taskCount={projectTasks.length}
              completedTasks={completedTasks}
              onClick={() => {
                setEditingProject(project);
                setProjectDialogOpen(true);
              }}
            />
          );
        })}
        
        {projects.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first project to organize your tasks and track progress.
            </p>
            <Button onClick={() => setProjectDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderCodeSnippetsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Code Snippets</h2>
          <p className="text-muted-foreground">Save and organize your code snippets</p>
        </div>
        <Button onClick={() => setSnippetDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Snippet
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {snippets.map((snippet) => (
          <CodeSnippetCard
            key={snippet.id}
            snippet={snippet}
            onEdit={() => {
              setEditingSnippet(snippet);
              setSnippetDialogOpen(true);
            }}
          />
        ))}
        
        {snippets.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Code2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No code snippets yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start saving useful code snippets for quick reference and reuse.
            </p>
            <Button onClick={() => setSnippetDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Snippet
            </Button>
          </div>
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

        <div className="grid gap-4">
          {allReviews.map((review) => (
            <Card 
              key={review.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleReviewClick(review)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GitPullRequest className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{review.pr_url.split('/').pop()}</h3>
                      <p className="text-sm text-muted-foreground">
                        Reviewed by {review.reviewer}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(review.status)}>
                    {review.status.replace('-', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{review.notes}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{format(review.created_at, 'MMM d, yyyy')}</span>
                  {review.task_id && (
                    <span>Linked to task</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderAnalyticsView = () => (
    <SmartAnalyticsDashboard />
  );

  const renderActiveView = () => {
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
        return renderCodeSnippetsView();
      case 'projects':
        return renderProjectsView();
      case 'analytics':
        return renderAnalyticsView();
      default:
        return renderTodayView();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 p-6">
          {renderActiveView()}
        </main>
      </div>

      {/* Dialogs */}
      <TaskDialog
        task={editingTask}
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSave={handleTaskSave}
        initialStatus={initialStatus}
      />

      <ProjectDialog
        project={editingProject}
        open={projectDialogOpen}
        onOpenChange={(open) => {
          setProjectDialogOpen(open);
          if (!open) setEditingProject(undefined);
        }}
        onSave={handleProjectSave}
      />

      <CodeSnippetDialog
        snippet={editingSnippet}
        open={snippetDialogOpen}
        onOpenChange={(open) => {
          setSnippetDialogOpen(open);
          if (!open) setEditingSnippet(undefined);
        }}
        onSave={handleSnippetSave}
      />

      <ReviewDialog
        review={editingReview}
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        onSave={handleReviewSave}
        tasks={tasks}
      />

      <GitHubRepoImport
        open={githubImportOpen}
        onOpenChange={setGithubImportOpen}
        onImportComplete={handleGithubImport}
        githubToken={githubToken}
      />

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
      />

      {/* GitHub Connection Dialog */}
      <Dialog open={showGithubDialog} onOpenChange={setShowGithubDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect to GitHub</DialogTitle>
            <DialogDescription>
              Enter your GitHub personal access token to sync with your repositories.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github-token">Personal Access Token</Label>
              <Input
                id="github-token"
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
              />
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
