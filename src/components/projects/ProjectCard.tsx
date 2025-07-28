import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ExternalLink, Calendar, GitBranch, Edit } from "lucide-react";
import { Project } from "@/types";
import { format } from "date-fns";

interface ProjectCardProps {
  project: Project;
  taskCount?: number;
  completedTasks?: number;
  onClick?: () => void;
}

export const ProjectCard = ({ project, taskCount = 0, completedTasks = 0, onClick }: ProjectCardProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'idea': return '💡';
      case 'active': return '🚀';
      case 'on-hold': return '⏸️';
      case 'done': return '✅';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idea': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'on-hold': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'done': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const completionPercentage = taskCount > 0 ? (completedTasks / taskCount) * 100 : 0;

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>{getStatusIcon(project.status)}</span>
              {project.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {project.description}
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(project.status)}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
            
            {project.repo_url && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  window.open(project.repo_url, '_blank'); 
                }}
              >
                <GitBranch className="h-3 w-3 mr-1" />
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>

          {taskCount > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{completedTasks}/{taskCount} tasks</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          )}

          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            Created {format(project.created_at, 'MMM d, yyyy')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};