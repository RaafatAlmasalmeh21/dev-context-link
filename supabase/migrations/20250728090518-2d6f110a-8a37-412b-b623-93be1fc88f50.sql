-- Create GitHub repositories table
CREATE TABLE public.github_repositories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  github_id BIGINT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  owner TEXT NOT NULL,
  html_url TEXT NOT NULL,
  clone_url TEXT,
  ssh_url TEXT,
  default_branch TEXT DEFAULT 'main',
  is_private BOOLEAN DEFAULT false,
  webhook_id BIGINT,
  webhook_secret TEXT,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pull requests table
CREATE TABLE public.pull_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repository_id UUID NOT NULL REFERENCES public.github_repositories(id) ON DELETE CASCADE,
  github_id BIGINT NOT NULL,
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  state TEXT NOT NULL CHECK (state IN ('open', 'closed', 'merged')),
  author TEXT NOT NULL,
  author_avatar_url TEXT,
  base_branch TEXT NOT NULL,
  head_branch TEXT NOT NULL,
  html_url TEXT NOT NULL,
  diff_url TEXT,
  patch_url TEXT,
  additions INTEGER DEFAULT 0,
  deletions INTEGER DEFAULT 0,
  changed_files INTEGER DEFAULT 0,
  mergeable BOOLEAN,
  merged_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(repository_id, github_id)
);

-- Create AI code reviews table
CREATE TABLE public.ai_code_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pull_request_id UUID NOT NULL REFERENCES public.pull_requests(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  summary TEXT,
  suggestions JSONB DEFAULT '[]',
  security_issues JSONB DEFAULT '[]',
  code_quality_issues JSONB DEFAULT '[]',
  performance_issues JSONB DEFAULT '[]',
  review_data JSONB DEFAULT '{}',
  ai_model TEXT DEFAULT 'gpt-4o',
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create code review comments table
CREATE TABLE public.code_review_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ai_review_id UUID NOT NULL REFERENCES public.ai_code_reviews(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  line_number INTEGER,
  comment_type TEXT NOT NULL CHECK (comment_type IN ('suggestion', 'issue', 'security', 'performance', 'style')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  suggested_fix TEXT,
  code_snippet TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.github_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pull_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_code_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_review_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for github_repositories
CREATE POLICY "Users can manage their own repositories" 
ON public.github_repositories 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for pull_requests
CREATE POLICY "Users can view PRs from their repositories" 
ON public.pull_requests 
FOR ALL 
USING (
  repository_id IN (
    SELECT id FROM public.github_repositories 
    WHERE user_id = auth.uid()
  )
);

-- Create RLS policies for ai_code_reviews
CREATE POLICY "Users can view AI reviews for their PRs" 
ON public.ai_code_reviews 
FOR ALL 
USING (
  pull_request_id IN (
    SELECT pr.id FROM public.pull_requests pr
    JOIN public.github_repositories repo ON pr.repository_id = repo.id
    WHERE repo.user_id = auth.uid()
  )
);

-- Create RLS policies for code_review_comments
CREATE POLICY "Users can view comments for their AI reviews" 
ON public.code_review_comments 
FOR ALL 
USING (
  ai_review_id IN (
    SELECT review.id FROM public.ai_code_reviews review
    JOIN public.pull_requests pr ON review.pull_request_id = pr.id
    JOIN public.github_repositories repo ON pr.repository_id = repo.id
    WHERE repo.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_github_repositories_user_id ON public.github_repositories(user_id);
CREATE INDEX idx_github_repositories_github_id ON public.github_repositories(github_id);
CREATE INDEX idx_pull_requests_repository_id ON public.pull_requests(repository_id);
CREATE INDEX idx_pull_requests_state ON public.pull_requests(state);
CREATE INDEX idx_pull_requests_created_at ON public.pull_requests(created_at DESC);
CREATE INDEX idx_ai_code_reviews_pull_request_id ON public.ai_code_reviews(pull_request_id);
CREATE INDEX idx_ai_code_reviews_status ON public.ai_code_reviews(status);
CREATE INDEX idx_code_review_comments_ai_review_id ON public.code_review_comments(ai_review_id);
CREATE INDEX idx_code_review_comments_severity ON public.code_review_comments(severity);

-- Add triggers for updated_at
CREATE TRIGGER update_github_repositories_updated_at
  BEFORE UPDATE ON public.github_repositories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pull_requests_updated_at
  BEFORE UPDATE ON public.pull_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_code_reviews_updated_at
  BEFORE UPDATE ON public.ai_code_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();