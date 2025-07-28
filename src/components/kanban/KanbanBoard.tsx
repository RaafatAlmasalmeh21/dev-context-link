import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Circle, Clock, CheckCircle } from "lucide-react";
import { Task } from "@/types";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onAddTask?: (status: "todo" | "in-progress" | "done") => void;
}

const statusConfig = {
  todo: {
    label: 'To Do',
    icon: Circle,
    color: 'bg-muted',
    iconColor: 'text-muted-foreground'
  },
  'in-progress': {
    label: 'In Progress',
    icon: Clock,
    color: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  done: {
    label: 'Done',
    icon: CheckCircle,
    color: 'bg-green-50',
    iconColor: 'text-green-600'
  },
} as const;

const priorityColors = {
  low: 'border-l-green-500',
  medium: 'border-l-yellow-500',
  high: 'border-l-red-500'
};

const typeColors = {
  feature: { bg: 'bg-blue-100', text: 'text-blue-800' },
  bug: { bg: 'bg-red-100', text: 'text-red-800' },
  improvement: { bg: 'bg-purple-100', text: 'text-purple-800' }
};

export const KanbanBoard = ({ tasks, onTaskClick, onAddTask }: KanbanBoardProps) => {
  const getTasksByStatus = (status: keyof typeof statusConfig) => {
    return tasks.filter(task => task.status === status);
  };

  const handleTaskClick = (task: Task) => {
    onTaskClick?.(task);
  };

  const handleAddTask = (status: keyof typeof statusConfig) => {
    onAddTask?.(status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.entries(statusConfig).map(([status, config]) => {
        const StatusIcon = config.icon;
        const statusTasks = getTasksByStatus(status as keyof typeof statusConfig);
        
        return (
          <Card key={status} className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <StatusIcon className={cn("h-4 w-4", config.iconColor)} />
                  <span>{config.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {statusTasks.length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleAddTask(status as keyof typeof statusConfig)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pt-0">
              <div className="space-y-3">
                {statusTasks.map((task) => (
                  <Card
                    key={task.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md border-l-4",
                      priorityColors[task.priority],
                      config.color
                    )}
                    onClick={() => handleTaskClick(task)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm leading-tight">
                            {task.title}
                          </h4>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs ml-2 flex-shrink-0",
                              typeColors[task.type].bg,
                              typeColors[task.type].text
                            )}
                          >
                            {task.type}
                          </Badge>
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between pt-2">
                          <Badge 
                            variant={task.priority === 'high' ? 'destructive' : 'outline'}
                            className="text-xs"
                          >
                            {task.priority}
                          </Badge>
                          
                          {task.due_date && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {statusTasks.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground text-sm">
                      No tasks in {config.label.toLowerCase()}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleAddTask(status as keyof typeof statusConfig)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add task
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};