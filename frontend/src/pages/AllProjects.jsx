import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Github, ExternalLink, Filter, ChevronDown, ArrowRight } from 'lucide-react';
import { projectsData } from '../data/projects';
import Dropdown from '../components/ui/Dropdown';
import { Skeleton } from '../components/ui/Skeleton';
import SEO from '../components/common/SEO';

import axiosClient from '../utils/axiosClient';

const ITEMS_PER_PAGE = 6;

export default function AllProjects() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        const res = await axiosClient.get('Projects');
        if (isMounted && res.data) {
          const mapped = res.data.map(p => ({
            id: p.id,
            title: p.title,
            desc: p.description || p.desc || "",
            tech: p.techStack || p.tech || [],
            image: p.mainImage || p.image || "",
            images: p.projectImages || p.images || [],
            date: p.projectDate || p.date || "",
            features: p.features || [],
            github: p.githubUrl || p.github || "",
            live: p.liveUrl || p.live || ""
          }));
          setProjects(mapped);
        }
      } catch (err) {
        console.warn('[ALL PROJECTS API] Connection issue. Falling back to local static data.', err);
        if (isMounted) {
          setProjects(projectsData);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProjects();
    return () => { isMounted = false; };
  }, []);

  // Extract unique tech stacks
  const allTechs = useMemo(() => {
    const techs = new Set();
    projects.forEach(p => p.tech.forEach(t => techs.add(t)));
    return ['All', ...Array.from(techs).sort()];
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let result = projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTech = selectedTech === 'All' || project.tech.includes(selectedTech);
      return matchesSearch && matchesTech;
    });

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [projects, searchQuery, selectedTech, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const currentProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTech, sortOrder]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-24 relative bg-[#0b0f1a]">
      <SEO 
        title="Works & Projects | Deepak Kushwaha"
        description="Browse the comprehensive portfolio of software development works, custom APIs, dashboard integrations, and open-source contributions designed by Deepak Kushwaha."
        keywords="Software Projects, Web Apps, React Developer, C# API, Portfolio Showcase, Deepak Kushwaha"
      />
      {/* Subtle Floating Background Elements for Linear look */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[15%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -20, 30, 0],
            y: [0, 40, -20, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[25%] right-[15%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Header */}
        <div className="mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6"
          >
            All <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Projects</span>
          </motion.h1>

          {/* Controls Bar with high-end minimal Vercel styling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center p-4 rounded-2xl bg-[#0f1424]/60 border border-white/5 backdrop-blur-xl"
          >
            {/* Search Bar - Sleek, perfect padding & styling */}
            <div className="relative w-full md:w-96 group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10">
                <Search className={`w-4 h-4 transition-colors duration-300 ${isSearchFocused ? 'text-blue-400' : 'text-zinc-500'}`} />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#080b14] border border-zinc-800/80 rounded-xl py-3 pl-12 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
              />
            </div>

            <Dropdown 
              options={[
                { label: "Newest First", value: "newest" },
                { label: "Oldest First", value: "oldest" }
              ]}
              value={sortOrder}
              onChange={setSortOrder}
              className="w-full md:w-48 z-20"
            />
          </motion.div>

          {/* Tech Stack Filter Pills */}
          <motion.div
            initial={false}
            animate={{ height: isFilterOpen || window.innerWidth >= 768 ? 'auto' : 0, opacity: isFilterOpen || window.innerWidth >= 768 ? 1 : 0 }}
            className="overflow-hidden md:overflow-visible mt-6"
          >
            <div className="flex flex-wrap gap-2 pt-2">
              {allTechs.map((tech) => (
                <button
                  key={tech}
                  onClick={() => setSelectedTech(tech)}
                  className={`relative px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 overflow-hidden group ${selectedTech === tech
                      ? 'text-white border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                      : 'bg-[#0f1424]/40 border border-zinc-800/60 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                >
                  {selectedTech === tech && (
                    <motion.div
                      layoutId="activeFilterBg"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{tech}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Projects Grid - Balanced 3 cols desktop, 2 cols tablet, 1 col mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="group bg-[#0f1424]/30 border border-white/5 rounded-2xl overflow-hidden flex flex-col h-[400px]">
                  <Skeleton className="h-48 w-full rounded-none" />
                  <div className="p-6 flex flex-col flex-grow gap-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="flex gap-2 mt-auto">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </div>
              ))
            ) : currentProjects.length > 0 ? (
              currentProjects.map((project, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.98, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 15 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  key={project.id}
                  className="group bg-[#0f1424]/30 border border-white/5 rounded-2xl overflow-hidden hover:border-zinc-700/50 transition-all duration-500 flex flex-col h-full backdrop-blur-md"
                >
                  {/* Image container */}
                  <div className="h-48 overflow-hidden relative bg-zinc-950">
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out opacity-75 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1424] via-transparent to-transparent opacity-80" />
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-grow relative">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">{project.title}</h3>
                      <div className="flex gap-2.5">
                        {project.github && (
                          <a href={project.github} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {project.live && (
                          <a href={project.live} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-zinc-400 text-sm mb-6 line-clamp-2 leading-relaxed flex-grow">{project.desc}</p>

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {project.tech.slice(0, 3).map((t, i) => (
                        <span key={i} className="px-2 py-0.5 text-xs font-semibold text-zinc-400 bg-zinc-900/60 border border-white/5 rounded-md">
                          {t}
                        </span>
                      ))}
                      {project.tech.length > 3 && (
                        <span className="px-2 py-0.5 text-xs font-semibold text-zinc-600 bg-zinc-950 border border-white/5 rounded-md">
                          +{project.tech.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Clear CTA Button */}
                    <button
                      onClick={() => navigate(`/works/${project.id}`)}
                      className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full py-24 text-center bg-[#0f1424]/20 rounded-2xl border border-white/5 backdrop-blur-sm"
              >
                <div className="w-16 h-16 bg-zinc-900/50 border border-zinc-800/80 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <Search className="w-6 h-6 text-zinc-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No projects found</h3>
                <p className="text-zinc-400 max-w-sm mx-auto text-sm">We couldn't find anything matching your search criteria. Try modifying your filters.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination with smooth Vercel/Linear feel */}
        {totalPages > 1 && (
          <motion.div layout className="flex items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#0f1424]/60 border border-white/5 text-zinc-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-zinc-800 hover:text-white transition-all backdrop-blur-md shadow-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <span className="text-zinc-400 text-xs font-semibold tracking-wider bg-[#0f1424]/60 px-5 py-2 rounded-full border border-white/5 backdrop-blur-md">
              PAGE {currentPage} OF {totalPages}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#0f1424]/60 border border-white/5 text-zinc-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-zinc-800 hover:text-white transition-all backdrop-blur-md shadow-md"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
