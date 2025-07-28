import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, Brain, Target } from "lucide-react";
import { Task } from "@/types";
import { useAnalytics } from "@/hooks/useAnalytics";

interface TaskDialogProps {
  task?: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: Task) => void;
  initialStatus?: "todo" | "in-progress" | "done";
}

export const TaskDialog = ({ task, open, onOpenChange, onSave, initialStatus = "todo" }: TaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">(initialStatus);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [type, setType] = useState<"feature" | "bug" | "improvement">("feature");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [estimatedHours, setEstimatedHours] = useState<number | undefined>(undefined);
  const [actualHours, setActualHours] = useState<number | undefined>(undefined);
  
  const { getTaskEstimation, recordTaskCompletion, isLoading } = useAnalytics();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status as "todo" | "in-progress" | "done");
      setPriority(task.priority as "low" | "medium" | "high");
      setType(task.type as "feature" | "bug" | "improvement");
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
      setEstimatedHours((task as any).estimated_hours);
      setActualHours((task as any).actual_hours);
    } else {
      setTitle("");
      setDescription("");
      setStatus(initialStatus);
      setPriority("medium");
      setType("feature");
      setDueDate(undefined);
      setEstimatedHours(undefined);
      setActualHours(undefined);
    }
  }, [task, initialStatus, open]);

  const handleGetTimeEstimate = async () => {
    if (!title.trim()) return;
    
    const taskData = { title, description, type, priority };
    const estimation = await getTaskEstimation(taskData, 'time_estimate');
    
    if (estimation?.estimation?.estimated_hours) {
      setEstimatedHours(estimation.estimation.estimated_hours);
    }
  };

  const handleGetSuggestions = async () => {
    if (!title.trim()) return;
    
    const taskData = { title, description, type, priority };
    const suggestions = await getTaskEstimation(taskData, 'category_suggestion');
    
    if (suggestions?.estimation) {
      if (suggestions.estimation.suggested_type) {
        setType(suggestions.estimation.suggested_type);
      }
      if (suggestions.estimation.suggested_priority) {
        setPriority(suggestions.estimation.suggested_priority);
      }
    }
  };

  const handleSave = async () => {
    const taskData: Task = {
      id: task?.id || crypto.randomUUID(),
      title,
      description,
      status: status as any,
      priority: priority as any,
      type: type as any,
      due_date: dueDate,
      created_at: task?.created_at || new Date(),
      updated_at: new Date(),
      ...((estimatedHours !== undefined || actualHours !== undefined) && {
        estimated_hours: estimatedHours,
        actual_hours: actualHours
      })
    };

    // If task is being marked as done and we have actual hours, record completion
    if (status === 'done' && actualHours && (!task || (task as any).status !== 'done')) {
      await recordTaskCompletion(taskData.id, actualHours, estimatedHours);
    }

    onSave(taskData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* AI-Enhanced Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated-hours">Estimated Hours</Label>
              <div className="flex gap-2">
                <Input
                  id="estimated-hours"
                  type="number"
                  step="0.5"
                  value={estimatedHours || ''}
                  onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || undefined)}
                  placeholder="0.0"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleGetTimeEstimate}
                  disabled={isLoading || !title.trim()}
                >
                  <Clock className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual-hours">Actual Hours</Label>
              <Input
                id="actual-hours"
                type="number"
                step="0.5"
                value={actualHours || ''}
                onChange={(e) => setActualHours(parseFloat(e.target.value) || undefined)}
                placeholder="0.0"
              />
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGetSuggestions}
              disabled={isLoading || !title.trim()}
              className="flex-1"
            >
              <Brain className="h-4 w-4 mr-2" />
              Get AI Suggestions
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              {task ? 'Update' : 'Create'} Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};