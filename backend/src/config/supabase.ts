import { createClient } from '@supabase/supabase-js';

// Validate required environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY'
  );
}

// Initialize Supabase client with anon key for client-side auth operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { createClient };
