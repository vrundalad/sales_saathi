-- Create the tasks table if it does not exist
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    company_name TEXT NOT NULL,
    task_title TEXT NOT NULL,
    task_description TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own tasks
CREATE POLICY "Allow users to view their own tasks" 
ON public.tasks 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own tasks
CREATE POLICY "Allow users to insert their own tasks" 
ON public.tasks 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own tasks
CREATE POLICY "Allow users to update their own tasks" 
ON public.tasks 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own tasks
CREATE POLICY "Allow users to delete their own tasks" 
ON public.tasks 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
