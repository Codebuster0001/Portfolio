import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({
  title = 'Codebuster | Full Stack Software Engineer Portfolio',
  description = 'Welcome to the professional portfolio of Codebuster, a Full Stack Developer specializing in React, .NET Core, SQL Server, and cloud-native solutions.',
  keywords = 'Full Stack Developer, Software Engineer, React Portfolio, .NET Core API, Web Developer, Portfolio, Supabase, ADO.NET',
  image = '/assets/portfolio-preview.jpg',
  url = window.location.href,
  type = 'website',
  schema = null,
}) {
  const siteUrl = window.location.origin;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  // Read verification and analytics keys from Vite env
  const googleSiteVerification = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION;
  const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  // Dynamically load Google Analytics if the measurement ID is configured
  useEffect(() => {
    if (!gaMeasurementId) return;

    // Check if the script is already loaded to avoid duplicates
    const scriptId = 'google-analytics-script';
    if (document.getElementById(scriptId)) return;

    // Create and append gtag script tag
    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    const inlineScript = document.createElement('script');
    inlineScript.id = 'google-analytics-init';
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaMeasurementId}', {
        page_path: window.location.pathname,
      });
    `;
    document.head.appendChild(inlineScript);

    return () => {
      // Clean up scripts on unmount if needed
      document.getElementById(scriptId)?.remove();
      document.getElementById('google-analytics-init')?.remove();
    };
  }, [gaMeasurementId]);

  // Track pageviews dynamically in GA on path change
  useEffect(() => {
    if (gaMeasurementId && window.gtag) {
      window.gtag('config', gaMeasurementId, {
        page_path: window.location.pathname,
      });
    }
  }, [url, gaMeasurementId]);

  // Default rich Person/Developer Schema
  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': 'Codebuster',
    'url': siteUrl,
    'image': fullImageUrl,
    'jobTitle': 'Full Stack Software Engineer',
    'description': description,
    'sameAs': [
      'https://github.com',
      'https://linkedin.com',
    ],
    'knowsAbout': [
      'Web Development',
      'Software Engineering',
      'React',
      'ASP.NET Core',
      'C#',
      'JavaScript',
      'Database Design',
      'API Security',
    ],
  };

  const finalSchema = schema || defaultSchema;

  return (
    <Helmet>
      {/* General Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Codebuster" />
      <link rel="canonical" href={url} />

      {/* Google Search Console Verification */}
      {googleSiteVerification && (
        <meta name="google-site-verification" content={googleSiteVerification} />
      )}

      {/* Open Graph / Facebook / LinkedIn */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Codebuster Portfolio" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* Structured JSON-LD Data Schema */}
      <script type="application/ld+json">
        {JSON.stringify(finalSchema)}
      </script>
    </Helmet>
  );
}
