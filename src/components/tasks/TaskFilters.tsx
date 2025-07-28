import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { Task, TaskStatus, TaskType, Priority } from "@/types";

interface TaskFiltersProps {
  tasks: Task[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilters: {
    status?: TaskStatus;
    type?: TaskType;
    priority?: Priority;
    tags?: string[];
  };
  onFilterChange: (filters: any) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, order: 'asc' | 'desc') => void;
}

export const TaskFilters = ({
  tasks,
  searchQuery,
  onSearchChange,
  selectedFilters,
  onFilterChange,
  sortBy,
  sortOrder,
  onSortChange
}: TaskFiltersProps) => {
  const allTags = Array.from(new Set(tasks.flatMap(task => task.tags || [])));

  const clearFilters = () => {
    onFilterChange({});
    onSearchChange("");
  };

  const hasActiveFilters = searchQuery || Object.keys(selectedFilters).some(key => 
    selectedFilters[key as keyof typeof selectedFilters]
  );

  const activeFilterCount = [
    selectedFilters.status,
    selectedFilters.type,
    selectedFilters.priority,
    selectedFilters.tags?.length
  ].filter(Boolean).length + (searchQuery ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filters:</span>
        </div>

        <Select
          value={selectedFilters.status || "all"}
          onValueChange={(value) => 
            onFilterChange({ 
              ...selectedFilters, 
              status: value === "all" ? undefined : value as TaskStatus
            })
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="doing">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedFilters.type || "all"}
          onValueChange={(value) => 
            onFilterChange({ 
              ...selectedFilters, 
              type: value === "all" ? undefined : value as TaskType
            })
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="code">Code</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="prompt">Prompt</SelectItem>
            <SelectItem value="doc">Documentation</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedFilters.priority || "all"}
          onValueChange={(value) => 
            onFilterChange({ 
              ...selectedFilters, 
              priority: value === "all" ? undefined : value as Priority
            })
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="med">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Controls */}
        <div className="flex items-center gap-1 ml-4">
          <span className="text-sm text-muted-foreground">Sort:</span>
          <Select
            value={sortBy}
            onValueChange={(value) => onSortChange(value, sortOrder)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Created</SelectItem>
              <SelectItem value="updated_at">Updated</SelectItem>
              <SelectItem value="due_date">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Active Tags Filter */}
      {selectedFilters.tags && selectedFilters.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Tags:</span>
          {selectedFilters.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => 
                  onFilterChange({
                    ...selectedFilters,
                    tags: selectedFilters.tags?.filter(t => t !== tag)
                  })
                }
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Available Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Available tags:</span>
          {allTags
            .filter(tag => !selectedFilters.tags?.includes(tag))
            .slice(0, 10) // Limit displayed tags
            .map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="cursor-pointer hover:bg-muted"
                onClick={() =>
                  onFilterChange({
                    ...selectedFilters,
                    tags: [...(selectedFilters.tags || []), tag]
                  })
                }
              >
                {tag}
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
};