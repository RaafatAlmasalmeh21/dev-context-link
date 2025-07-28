import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Review, ReviewStatus, Task } from "@/types";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (reviewData: Partial<Review>) => void;
  review?: Review;
  tasks: Task[];
}

export const ReviewDialog = ({ 
  open, 
  onOpenChange, 
  onSave, 
  review,
  tasks 
}: ReviewDialogProps) => {
  const [formData, setFormData] = useState({
    pr_url: review?.pr_url || '',
    notes: review?.notes || '',
    status: review?.status || 'open' as ReviewStatus,
    reviewer: review?.reviewer || '',
    task_id: review?.task_id || 'none',
  });

  // Reset form when review or dialog state changes
  useEffect(() => {
    if (open) {
      setFormData({
        pr_url: review?.pr_url || '',
        notes: review?.notes || '',
        status: review?.status || 'open' as ReviewStatus,
        reviewer: review?.reviewer || '',
        task_id: review?.task_id || 'none',
      });
    }
  }, [review, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pr_url.trim()) return;
    
    const reviewData: Partial<Review> = {
      ...formData,
      task_id: formData.task_id === 'none' ? undefined : formData.task_id,
      id: review?.id,
    };
    
    onSave(reviewData);
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {review ? 'Edit Review' : 'Add New Review'}
          </DialogTitle>
          <DialogDescription>
            {review ? 'Update the review details below.' : 'Add a new code review to track.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pr-url">Pull Request URL *</Label>
            <Input
              id="pr-url"
              placeholder="https://github.com/user/repo/pull/123"
              value={formData.pr_url}
              onChange={(e) => handleInputChange('pr_url', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviewer">Reviewer</Label>
            <Input
              id="reviewer"
              placeholder="john_doe"
              value={formData.reviewer}
              onChange={(e) => handleInputChange('reviewer', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="changes-requested">Changes Requested</SelectItem>
                <SelectItem value="merged">Merged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task">Link to Task (Optional)</Label>
            <Select 
              value={formData.task_id} 
              onValueChange={(value) => handleInputChange('task_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a task..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No task</SelectItem>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Review notes and feedback..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {review ? 'Update Review' : 'Add Review'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};