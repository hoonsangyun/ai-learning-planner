# User Authentication & Database Architecture (StudyLens)

This document outlines the strategy for handling user authentication and ensuring data privacy (Row Level Security) using **Supabase** in the StudyLens web app.

## 1. Authentication Strategy (Supabase Auth)
- **Tool:** Supabase Auth
- **Why:** It provides a seamless integration with PostgreSQL and native support for Row Level Security (RLS), meaning we can enforce data access rules directly at the database level rather than just the application level.
- **Implementation:**
  - Use `@supabase/ssr` or `@supabase/auth-helpers-nextjs` for Next.js App Router integration.
  - Users will log in via Email/Password or OAuth (Google).
  - Upon successful login, Supabase generates a secure JWT token containing the `user_id`.

## 2. Database Schema (PostgreSQL on Supabase)

We migrate from Prisma to a direct Supabase schema (or keep Prisma but use Supabase as the underlying provider with RLS enabled).

```sql
-- Create custom types
CREATE TYPE role_type AS ENUM ('user', 'ai');

-- 1. Users Table (Automatically managed by Supabase Auth, but we can extend it)
-- References auth.users provided by Supabase.

-- 2. Problem Table
CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_understood BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ChatMessage Table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Denormalized for easier RLS
    role role_type NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Formula Table
CREATE TABLE formulas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES problems(id) ON DELETE SET NULL,
    latex TEXT NOT NULL,
    description TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. Row Level Security (RLS) Policies

To ensure that each middle school student only sees their own study materials, we will enable RLS on all tables and create policies based on the `auth.uid()`.

```sql
-- Enable RLS on all tables
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;

-- Problems Policies
CREATE POLICY "Users can only insert their own problems"
ON problems FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only view their own problems"
ON problems FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only update their own problems"
ON problems FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own problems"
ON problems FOR DELETE USING (auth.uid() = user_id);

-- Formulas Policies
CREATE POLICY "Users can only insert their own formulas"
ON formulas FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only view their own formulas"
ON formulas FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only update their own formulas"
ON formulas FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own formulas"
ON formulas FOR DELETE USING (auth.uid() = user_id);

-- ChatMessage Policies
-- Since we added user_id to chat_messages, the RLS policy is straightforward.
CREATE POLICY "Users can only view/insert chat messages for their own problems"
ON chat_messages FOR ALL USING (auth.uid() = user_id);
```

## 4. Frontend Integration
In Next.js components, we will instantiate the Supabase client:

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Example: Fetching formulas safely
const supabase = createClientComponentClient()
const { data: formulas, error } = await supabase
  .from('formulas')
  .select('*')
// No need to append `.eq('user_id', currentUserId)` because RLS handles it automatically!
```

This ensures complete isolation of learning data, preventing students from accessing each other's notes or chat history.