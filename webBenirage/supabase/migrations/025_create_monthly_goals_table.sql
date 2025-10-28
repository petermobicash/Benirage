-- Create monthly_goals table for tracking organizational goals and progress
CREATE TABLE IF NOT EXISTS monthly_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('membership', 'volunteer', 'donation', 'content', 'engagement', 'outreach')),
    target_value INTEGER NOT NULL,
    current_value INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'count',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue', 'paused')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_monthly_goals_status ON monthly_goals(status);
CREATE INDEX IF NOT EXISTS idx_monthly_goals_end_date ON monthly_goals(end_date);
CREATE INDEX IF NOT EXISTS idx_monthly_goals_category ON monthly_goals(category);

-- Enable Row Level Security (RLS)
ALTER TABLE monthly_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view all goals" ON monthly_goals
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own goals" ON monthly_goals
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND created_by = auth.uid());

CREATE POLICY "Users can update their own goals" ON monthly_goals
    FOR UPDATE USING (auth.role() = 'authenticated' AND created_by = auth.uid());

CREATE POLICY "Users can delete their own goals" ON monthly_goals
    FOR DELETE USING (auth.role() = 'authenticated' AND created_by = auth.uid());

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_monthly_goals_updated_at
    BEFORE UPDATE ON monthly_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for demonstration
INSERT INTO monthly_goals (title, description, category, target_value, current_value, unit, start_date, end_date, priority) VALUES
('New Membership Applications', 'Increase membership applications by 25%', 'membership', 50, 32, 'applications', '2024-10-01', '2024-10-31', 'high'),
('Volunteer Recruitment', 'Recruit 20 new volunteers for community programs', 'volunteer', 20, 15, 'volunteers', '2024-10-01', '2024-10-31', 'medium'),
('Monthly Donations Target', 'Reach $5,000 in monthly donations', 'donation', 5000, 3200, 'USD', '2024-10-01', '2024-10-31', 'high'),
('Content Creation', 'Publish 12 new blog posts and articles', 'content', 12, 12, 'posts', '2024-10-01', '2024-10-31', 'medium'),
('Community Engagement', 'Achieve 85% engagement rate on social media', 'engagement', 85, 89, 'percentage', '2024-10-01', '2024-10-31', 'medium')
ON CONFLICT DO NOTHING;