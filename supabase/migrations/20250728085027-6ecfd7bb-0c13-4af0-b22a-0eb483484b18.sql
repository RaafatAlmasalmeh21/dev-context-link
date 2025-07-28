-- Create analytics and goal tracking tables
CREATE TABLE public.task_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID NOT NULL,
  estimated_hours DECIMAL(4,1),
  actual_hours DECIMAL(4,1),
  completion_date TIMESTAMP WITH TIME ZONE,
  efficiency_score DECIMAL(3,2), -- actual vs estimated ratio
  complexity_score INTEGER DEFAULT 1, -- 1-5 scale
  interruptions_count INTEGER DEFAULT 0,
  focus_time_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user goals table
CREATE TABLE public.user_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL, -- 'daily_tasks', 'weekly_hours', 'efficiency', 'focus_time'
  target_value DECIMAL(8,2) NOT NULL,
  current_value DECIMAL(8,2) DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'failed', 'paused'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create productivity insights table
CREATE TABLE public.productivity_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL, -- 'efficiency_trend', 'peak_hours', 'task_patterns', 'recommendations'
  insight_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.task_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_insights ENABLE ROW LEVEL SECURITY;

-- Create policies for task_analytics
CREATE POLICY "Users can view their own analytics" 
ON public.task_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics" 
ON public.task_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics" 
ON public.task_analytics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for user_goals
CREATE POLICY "Users can view their own goals" 
ON public.user_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" 
ON public.user_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.user_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
ON public.user_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for productivity_insights
CREATE POLICY "Users can view their own insights" 
ON public.productivity_insights 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insights" 
ON public.productivity_insights 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_task_analytics_user_id ON public.task_analytics(user_id);
CREATE INDEX idx_task_analytics_task_id ON public.task_analytics(task_id);
CREATE INDEX idx_task_analytics_completion_date ON public.task_analytics(completion_date);
CREATE INDEX idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX idx_user_goals_period ON public.user_goals(period_start, period_end);
CREATE INDEX idx_productivity_insights_user_id ON public.productivity_insights(user_id);
CREATE INDEX idx_productivity_insights_type ON public.productivity_insights(insight_type);

-- Add foreign key constraints
ALTER TABLE public.task_analytics 
ADD CONSTRAINT fk_task_analytics_task 
FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Create triggers for timestamps
CREATE TRIGGER update_task_analytics_updated_at
BEFORE UPDATE ON public.task_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at
BEFORE UPDATE ON public.user_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();