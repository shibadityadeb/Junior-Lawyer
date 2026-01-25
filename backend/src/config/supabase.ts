import { createClient } from '@supabase/supabase-js';

// Validate required environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY'
  );
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    'Missing required Supabase environment variable: SUPABASE_SERVICE_ROLE_KEY'
  );
}

// Initialize Supabase client with anon key for client-side auth operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Supabase client with service role key for server-side operations
// This bypasses RLS policies for administrative operations like profile creation
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export { createClient };
