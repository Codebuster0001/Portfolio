import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Export a dummy client if env vars are missing so the app doesn't crash
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from: () => ({
        select: async () => ({ data: [], count: 0, error: { message: 'Supabase not configured' } }),
        insert: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        upsert: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      })
    };
