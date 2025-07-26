import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  CheckSquare, 
  Code2, 
  FolderOpen, 
  GitPullRequest, 
  MessageSquare,
  Plus,
  Zap
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'tasks', label: 'All Tasks', icon: CheckSquare },
    { id: 'prompts', label: 'Prompts', icon: MessageSquare },
    { id: 'reviews', label: 'Reviews', icon: GitPullRequest },
    { id: 'code', label: 'Code Snippets', icon: Code2 },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
  ];

  return (
    <aside className={cn(
      "border-r bg-card transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-full flex-col">
        <div className="p-4">
          <Button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="ghost" 
            size="sm"
            className="w-full justify-start"
          >
            {!isCollapsed && "Collapse"}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeView === item.id ? "default" : "ghost"}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "px-2"
                )}
              >
                <Icon className="h-4 w-4" />
                {!isCollapsed && <span className="ml-2">{item.label}</span>}
              </Button>
            );
          })}
        </nav>

        <div className="p-2 border-t">
          <Button 
            className="w-full justify-start" 
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Quick Add</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
};