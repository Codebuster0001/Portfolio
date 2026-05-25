import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, Github, Linkedin, Twitter, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useGetHeroQuery } from '../store/portfolioApi';

// Derive initials from a full name string e.g. "Deepak Kushwaha" → "DK"
function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

const navLinks = [
  { name: 'Home', id: 'home' },
  { name: 'About', id: 'about' },
  { name: 'Projects', id: 'projects' },
  { name: 'Skills', id: 'skills' },
  { name: 'Experience', id: 'experience' },
  { name: 'Contact', id: 'contact' },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  // Fetch name from Hero API
  const { data: heroData } = useGetHeroQuery();
  const initials = getInitials(heroData?.name || 'Portfolio');

  // Scroll to section — offsets for the fixed 80px navbar
  const scrollToSection = (id) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.replaceState(null, '', '/');
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const navbarHeight = 80; // matches the fixed navbar height
      const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top, behavior: 'smooth' });
      history.replaceState(null, '', `/${id}`);
    }
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    setScrolled(latest > 20);
    if (latest > 150 && latest > previous) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith('/works')) {
      setActiveSection('');
      return;
    }
    
    let observer;
    const sections = document.querySelectorAll('section[id]');

    const timer = setTimeout(() => {
      const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0,
      };
      const observerCallback = (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActiveSection(id);
            // Update URL without hash as user scrolls between sections
            history.replaceState(null, '', id === 'home' ? '/' : `/${id}`);
          }
        });
      };
      observer = new IntersectionObserver(observerCallback, observerOptions);
      sections.forEach((section) => observer.observe(section));
    }, 500);

    return () => {
      clearTimeout(timer);
      if (observer) {
        sections.forEach((section) => observer.unobserve(section));
      }
    };
  }, [location.pathname]);

  const handleNavClick = (id) => {
    if (location.pathname !== '/') {
      // Navigate home and pass the target section via router state
      navigate('/', { state: { scrollTo: id } });
    } else {
      // Already on home — just scroll
      scrollToSection(id);
    }
    setIsOpen(false);
  };

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-zinc-950/70 backdrop-blur-xl border-b border-white/10 py-3 shadow-lg shadow-black/20'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 group"
        >
          {/* Logo Icon */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          {/* Full name — hidden on very small screens */}
          <span className="hidden sm:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            {heroData?.name || 'Portfolio'}
          </span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.id)}
              className={`text-sm font-medium transition-colors hover:text-blue-400 relative ${
                activeSection === link.id ? 'text-blue-400' : 'text-zinc-400'
              }`}
            >
              {link.name}
              {activeSection === link.id && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400"
                  initial={false}
                />
              )}
            </button>
          ))}
          {heroData?.resumeUrl && (
            <Button 
              variant="outline" 
              onClick={() => window.open(heroData.resumeUrl, '_blank')}
              className="border-blue-500/50 hover:bg-blue-500/10 text-blue-400"
            >
              Resume
            </Button>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-zinc-950 border-zinc-800 text-white w-[300px] p-6">
              <div className="flex flex-col space-y-6 mt-8">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.id)}
                    className={`text-left text-lg font-medium transition-colors hover:text-blue-400 ${
                      activeSection === link.id ? 'text-blue-400' : 'text-zinc-400'
                    }`}
                  >
                    {link.name}
                  </button>
                ))}
                {heroData?.resumeUrl && (
                  <Button 
                    onClick={() => window.open(heroData.resumeUrl, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                  >
                    Resume
                  </Button>
                )}
                <div className="flex items-center space-x-4 pt-6 border-t border-zinc-800">
                  <Github className="h-5 w-5 text-zinc-400 hover:text-white cursor-pointer" />
                  <Linkedin className="h-5 w-5 text-zinc-400 hover:text-white cursor-pointer" />
                  <Twitter className="h-5 w-5 text-zinc-400 hover:text-white cursor-pointer" />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
