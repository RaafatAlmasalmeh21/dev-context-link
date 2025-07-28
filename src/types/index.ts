export type TaskStatus = 'todo' | 'doing' | 'review' | 'done';
export type TaskType = 'code' | 'review' | 'prompt' | 'doc';
export type Priority = 'low' | 'med' | 'high';
export type ProjectStatus = 'idea' | 'active' | 'on-hold' | 'done';
export type ReviewStatus = 'open' | 'changes-requested' | 'merged';

export interface Project {
  id: string;
  name: string;
  description: string;
  repo_url?: string;
  status: ProjectStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: Priority;
  due_date?: Date;
  project_id?: string;
  project?: Project;
  estimated_hours?: number;
  actual_hours?: number;
  user_id?: string;
  tags?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface Prompt {
  id: string;
  prompt_text: string;
  response_snippet: string;
  created_at: Date;
  task_id?: string;
  task?: Task;
  tags: string[];
}

export interface Snippet {
  id: string;
  file_path: string;
  code_text: string;
  commit_sha?: string;
  task_id?: string;
  task?: Task;
  created_at: Date;
}

export interface Review {
  id: string;
  pr_url: string;
  notes: string;
  status: ReviewStatus;
  reviewer: string;
  task_id?: string;
  task?: Task;
  created_at: Date;
  updated_at: Date;
}