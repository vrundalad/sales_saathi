-- Create the enterprise_leads table
create table public.enterprise_leads (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    company_name text not null,
    work_email text not null,
    phone_number text not null,
    team_size text not null,
    requirements text not null,
    status text default 'pending' not null, -- Useful for your sales team to track
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.enterprise_leads enable row level security;

-- Policy: Allow authenticated users to insert their own leads
create policy "Users can insert their own enterprise leads"
    on public.enterprise_leads
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Policy: Allow authenticated users to read their own leads (optional, but good practice)
create policy "Users can view their own enterprise leads"
    on public.enterprise_leads
    for select
    to authenticated
    using (auth.uid() = user_id);
