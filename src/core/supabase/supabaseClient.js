import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ujalovcddzrmljckyavc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqYWxvdmNkZHpybWxqY2t5YXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NTc0MTQsImV4cCI6MjEwNzEzMzQxNH0.rAaFhKo-WPE77QINYARMrfRy0gYHBbFAdQOqJ5_u1Lk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export async function checkSupabaseConnection() {
  try {
    const { error } = await supabase.from('characters').select('id').limit(1);
    // Reachable response indicates working API connectivity
    return !error || error.code === 'PGRST205' || !error.message?.includes('fetch failed');
  } catch {
    return false;
  }
}

export default supabase;
