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

/**
 * Tracks a visitor session in Supabase.
 * @param {Object} visitorData 
 */
export const trackVisitor = async (visitorData) => {
  if (!supabaseUrl) return; // Fail silently if not configured
  
  try {
    // Note: In production, you'd use a more sophisticated method to track sessions
    const { data, error } = await supabase
      .from('visitors')
      .upsert(visitorData, { onConflict: 'ip_hash,session_id' });
      
    if (error) console.error('Error tracking visitor:', error);
  } catch (err) {
    console.error('Analytics error:', err);
  }
};

/**
 * Tracks a custom analytics event in Supabase.
 * @param {string} eventName 
 * @param {Object} eventData 
 */
export const trackSupabaseEvent = async (eventName, eventData = {}) => {
  if (!supabaseUrl) return;

  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_name: eventName,
        event_data: eventData,
        // session_id and visitor_id would ideally be grabbed from a global context/cookie
        session_id: localStorage.getItem('session_id') || 'unknown',
      });
      
    if (error) console.error('Error tracking event:', error);
  } catch (err) {
    console.error('Analytics event error:', err);
  }
};
