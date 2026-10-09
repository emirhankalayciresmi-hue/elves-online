import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ujalovcddzrmljckyavc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqYWxvdmNkZHpybWxqY2t5YXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NTc0MTQsImV4cCI6MjEwNzEzMzQxNH0.rAaFhKo-WPE77QINYARMrfRy0gYHBbFAdQOqJ5_u1Lk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('_dummy').select('*').limit(1);
    // Even if _dummy table doesn't exist, reachable status 404/PGRST205 proves API is connected
    return !error || error.code === 'PGRST205' || error.message?.includes('relation');
  } catch {
    return false;
  }
}
