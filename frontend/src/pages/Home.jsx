import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';

import Hero from '../components/Hero';
import SEO from '../components/common/SEO';

import About from './About';
import Projects from './Projects';
import Skills from './Skills';
import Experience from './Experience';
import Contact from './Contact';

import Reveal from '../components/animations/Reveal';
import Parallax from '../components/animations/Parallax';

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    // Prevent browser from auto-restoring scroll position
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const NAVBAR_HEIGHT = 80;

    // Helper: scroll to a section by id with navbar offset
    const scrollTo = (id) => {
      if (!id || id === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      // Retry up to 10 times (50ms apart) to wait for the section to mount
      let attempts = 0;
      const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
          window.scrollTo({ top, behavior: 'smooth' });
        } else if (attempts < 10) {
          attempts++;
          setTimeout(tryScroll, 80);
        }
      };
      setTimeout(tryScroll, 100);
    };

    const isReload =
      performance.getEntriesByType('navigation')[0]?.type === 'reload';

    if (isReload) {
      // On page refresh → go to top
      window.scrollTo(0, 0);
      history.replaceState(null, '', '/');
      return;
    }

    // 1️⃣ Priority: came from navbar click on another page (router state)
    if (location.state?.scrollTo) {
      scrollTo(location.state.scrollTo);
      // Clear the state so a refresh doesn't re-scroll
      history.replaceState({}, '', location.state.scrollTo === 'home' ? '/' : `/${location.state.scrollTo}`);
      return;
    }

    // 2️⃣ Fallback: direct URL like /skills → scroll to that section
    const path = window.location.pathname.substring(1);
    if (path) {
      scrollTo(path);
    }
  }, [location.state]);


  return (
    <div className="relative w-full">
      <SEO 
        title="Deepak Kushwaha | Full Stack Software Engineer Portfolio"
        description="Explore Deepak Kushwaha's software engineering portfolio showcasing high-performance enterprise applications, interactive user experiences, and secure APIs."
      />
      <Hero />

      <section id="about" className="snap-start container mx-auto px-4 md:px-6 min-h-screen flex items-center justify-center">
        <Reveal className="w-full"><About /></Reveal>
      </section>
      
      <section id="projects" className="snap-start container mx-auto px-4 md:px-6 min-h-screen flex items-center justify-center overflow-hidden">
        <Reveal className="w-full"><Projects /></Reveal>
      </section>
      
      <section id="skills" className="snap-start container mx-auto px-4 md:px-6 min-h-screen flex items-center justify-center">
        <Reveal className="w-full"><Skills /></Reveal>
      </section>
      
      <section id="experience" className="snap-start container mx-auto px-4 md:px-6 min-h-screen flex items-center justify-center">
        <Reveal className="w-full"><Experience /></Reveal>
      </section>
      
      <section id="contact" className="snap-start container mx-auto px-4 md:px-6 min-h-screen flex items-center justify-center">
        <Reveal className="w-full"><Contact /></Reveal>
      </section>
    </div>
  );
};

export default Home;
