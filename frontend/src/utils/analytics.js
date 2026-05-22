// Google Analytics 4 (GA4) Utility
// Uses gtag.js for tracking

// Replace this with your actual GA4 Measurement ID in production
// It's recommended to pull this from an environment variable: import.meta.env.VITE_GA_MEASUREMENT_ID
export const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; 

// Initialize GA4
export const initGA = () => {
  if (typeof window === 'undefined') return;
  
  // Prevent duplicate initialization
  if (window.dataLayer) return;

  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // We handle page views manually for SPA routing
  });
};

// Track Page View
export const trackPageView = (path, title) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
    });
  }
};

// Track Custom Events
export const trackEvent = (action, category, label, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Specific standard events
export const trackContactSubmit = () => {
  trackEvent('contact_submit', 'engagement', 'Contact Form');
};

export const trackResumeDownload = () => {
  trackEvent('resume_download', 'engagement', 'Resume');
};

export const trackProjectView = (projectName) => {
  trackEvent('view_project', 'engagement', projectName);
};

export const trackGithubClick = (repoName) => {
  trackEvent('github_click', 'engagement', repoName);
};

export const trackLiveDemoClick = (projectName) => {
  trackEvent('live_demo_click', 'engagement', projectName);
};
