import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { QuickPrompt } from "@/components/prompts/QuickPrompt";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task, TaskStatus, Prompt } from "@/types";
import { Plus, Calendar, Target, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [initialStatus, setInitialStatus] = useState<TaskStatus>('todo');
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();

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
      task_id: taskId,
      tags: [],
    };
    setPrompts(prev => [...prev, newPrompt]);
    toast({
      title: "Prompt saved",
      description: "Your prompt and response have been saved.",
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
      </div>
      <div className="grid gap-4">
        {prompts.map((prompt) => (
          <Card key={prompt.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">
                  {prompt.prompt_text.substring(0, 100)}...
                </CardTitle>
                {prompt.task_id && (
                  <Badge variant="outline">
                    Task: {tasks.find(t => t.id === prompt.task_id)?.title}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {prompt.response_snippet.substring(0, 200)}...
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {prompt.created_at.toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
        {prompts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No prompts saved yet</p>
            </CardContent>
          </Card>
        )}
      </div>
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
        task={editingTask}
        initialStatus={initialStatus}
        onSave={handleTaskSave}
      />
    </div>
  );
};