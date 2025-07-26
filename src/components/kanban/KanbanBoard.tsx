import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Circle, Clock, Eye, CheckCircle } from "lucide-react";
import { Task, TaskStatus } from "@/types";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onAddTask?: (status: TaskStatus) => void;
}

const statusConfig = {
  todo: {
    label: 'To Do',
    icon: Circle,
    color: 'bg-muted',
    iconColor: 'text-muted-foreground'
  },
  doing: {
    label: 'In Progress',
    icon: Clock,
    color: 'bg-info/10',
    iconColor: 'text-info'
  },
  review: {
    label: 'Review',
    icon: Eye,
    color: 'bg-warning/10',
    iconColor: 'text-warning'
  },
  done: {
    label: 'Done',
    icon: CheckCircle,
    color: 'bg-success/10',
    iconColor: 'text-success'
  }
};

const priorityColors = {
  low: 'border-l-muted-foreground',
  med: 'border-l-warning',
  high: 'border-l-destructive'
};

const typeColors = {
  code: 'bg-primary/10 text-primary',
  review: 'bg-info/10 text-info',
  prompt: 'bg-warning/10 text-warning',
  doc: 'bg-success/10 text-success'
};

export const KanbanBoard = ({ tasks, onTaskClick, onAddTask }: KanbanBoardProps) => {
  const columns = Object.keys(statusConfig) as TaskStatus[];
  
  const getTasksByStatus = (status: TaskStatus) => 
    tasks.filter(task => task.status === status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
      {columns.map((status) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        const columnTasks = getTasksByStatus(status);
        
        return (
          <div key={status} className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", config.iconColor)} />
                <h3 className="font-semibold">{config.label}</h3>
                <Badge variant="secondary" className="text-xs">
                  {columnTasks.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddTask?.(status)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3 flex-1">
              {columnTasks.map((task) => (
                <Card
                  key={task.id}
                  className={cn(
                    "cursor-pointer hover:shadow-md transition-shadow border-l-4",
                    priorityColors[task.priority]
                  )}
                  onClick={() => onTaskClick?.(task)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-medium line-clamp-2">
                        {task.title}
                      </CardTitle>
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs", typeColors[task.type])}
                      >
                        {task.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="capitalize">{task.priority} priority</span>
                      {task.due_date && (
                        <span>
                          Due {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No tasks</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};