const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5225';

/**
 * Tracks a visitor session via the backend API.
 * @param {Object} visitorData 
 */
export const trackVisitor = async (visitorData) => {
  try {
    const response = await fetch(`${API_URL}/api/analytics/visitor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(visitorData),
    });
    
    if (!response.ok) console.error('Error tracking visitor');
  } catch (err) {
    console.error('Analytics error:', err);
  }
};

/**
 * Tracks a custom analytics event via the backend API.
 * @param {string} eventName 
 * @param {Object} eventData 
 */
export const trackSupabaseEvent = async (eventName, eventData = {}) => {
  try {
    const response = await fetch(`${API_URL}/api/analytics/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName,
        eventData,
        sessionId: localStorage.getItem('session_id') || 'unknown',
      }),
    });
      
    if (!response.ok) console.error('Error tracking event');
  } catch (err) {
    console.error('Analytics event error:', err);
  }
};
