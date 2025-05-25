-- Create instagram_accounts table
CREATE TABLE instagram_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  instagram_user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, instagram_user_id)
);

-- Enable RLS
ALTER TABLE instagram_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own Instagram accounts" ON instagram_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Instagram accounts" ON instagram_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Instagram accounts" ON instagram_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Instagram accounts" ON instagram_accounts
  FOR DELETE USING (auth.uid() = user_id);