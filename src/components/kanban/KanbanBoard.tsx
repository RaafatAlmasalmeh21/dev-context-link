import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Plus, Calendar, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Task, TaskStatus } from '../../types';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverEvent,
  UniqueIdentifier,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onAddTask?: (status: TaskStatus) => void;
  onTaskStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

// Draggable Task Card Component
interface DraggableTaskCardProps {
  task: Task;
  onTaskClick?: (task: Task) => void;
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({ task, onTaskClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    low: 'border-l-green-500',
    med: 'border-l-yellow-500',
    high: 'border-l-red-500',
  };

  const typeColors = {
    code: 'bg-blue-100 text-blue-800',
    review: 'bg-purple-100 text-purple-800',
    prompt: 'bg-green-100 text-green-800',
    doc: 'bg-orange-100 text-orange-800',
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-pointer border-l-4 ${priorityColors[task.priority]} hover:shadow-md transition-shadow`}
      onClick={() => onTaskClick?.(task)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm">{task.title}</h4>
          <Badge className={`text-xs ${typeColors[task.type]}`}>
            {task.type}
          </Badge>
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            {task.priority}
          </Badge>
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{format(task.due_date, 'MMM dd')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Droppable Column Component
interface DroppableColumnProps {
  status: TaskStatus;
  label: string;
  icon: React.ReactNode;
  color: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onAddTask?: (status: TaskStatus) => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  status,
  label,
  icon,
  color,
  tasks,
  onTaskClick,
  onAddTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col h-full transition-colors ${isOver ? 'bg-muted/50' : ''}`}
      data-column={status}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${color}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{label}</h3>
            <Badge variant="secondary" className="text-xs">
              {tasks.length}
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddTask?.(status)}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3 min-h-[400px]" data-droppable-id={status}>
          {tasks.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <p className="text-sm">No tasks in {label.toLowerCase()}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddTask?.(status)}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          ) : (
            tasks.map((task) => (
              <DraggableTaskCard
                key={task.id}
                task={task}
                onTaskClick={onTaskClick}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskClick,
  onAddTask,
  onTaskStatusChange,
}) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const statusConfig = {
    todo: {
      label: 'To Do',
      icon: <Clock className="w-4 h-4" />,
      color: 'bg-slate-100 text-slate-600',
    },
    doing: {
      label: 'In Progress', 
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-600',
    },
    done: {
      label: 'Done',
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'bg-green-100 text-green-600',
    },
  } as const;

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTask(null);
    
    if (!over) {
      return;
    }

    const activeTaskId = active.id as string;
    const activeTask = tasks.find(t => t.id === activeTaskId);
    
    if (!activeTask) {
      return;
    }

    // Determine the target status
    let targetStatus: TaskStatus;
    
    // Check if dropped directly on a column
    if (over.id === 'todo' || over.id === 'doing' || over.id === 'done') {
      targetStatus = over.id as TaskStatus;
    } else {
      // Check if dropped on another task
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask) {
        targetStatus = overTask.status;
      } else {
        return; // Invalid drop target
      }
    }
    
    // Only update if status actually changed
    if (activeTask.status !== targetStatus) {
      console.log(`Moving task ${activeTaskId} from ${activeTask.status} to ${targetStatus}`);
      onTaskStatusChange?.(activeTaskId, targetStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {Object.entries(statusConfig).map(([status, config]) => (
          <div key={status} className="bg-muted/30 rounded-lg p-4 min-h-[500px] transition-colors">
            <DroppableColumn
              status={status as TaskStatus}
              label={config.label}
              icon={config.icon}
              color={config.color}
              tasks={getTasksByStatus(status as TaskStatus)}
              onTaskClick={onTaskClick}
              onAddTask={onAddTask}
            />
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <Card className="cursor-pointer border-l-4 border-l-blue-500 opacity-90 rotate-2 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm">{activeTask.title}</h4>
                <Badge className="text-xs bg-blue-100 text-blue-800">
                  {activeTask.type}
                </Badge>
              </div>
              {activeTask.description && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {activeTask.description}
                </p>
              )}
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};