import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Github, ExternalLink, Calendar, Cpu, CheckCircle } from 'lucide-react';
import { projectsData } from '../data/projects';
import { Skeleton } from '../components/ui/Skeleton';

import axiosClient from '../utils/axiosClient';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;

    const getDetails = async () => {
      try {
        const res = await axiosClient.get(`Projects/${id}`);
        if (isMounted && res.data) {
          const mapped = {
            id: res.data.id,
            title: res.data.title,
            desc: res.data.description || res.data.desc || "",
            tech: res.data.techStack || res.data.tech || [],
            image: res.data.mainImage || res.data.image || "",
            images: res.data.projectImages || res.data.images || [],
            date: res.data.projectDate || res.data.date || "",
            features: res.data.features || [],
            github: res.data.githubUrl || res.data.github || "",
            live: res.data.liveUrl || res.data.live || ""
          };
          setProject(mapped);
          setActiveImage(mapped.images && mapped.images.length > 0 ? mapped.images[0] : mapped.image);
        }
      } catch (err) {
        console.warn('[DETAILS API] Connection issue or not found. Falling back to local static item.', err);
        if (isMounted) {
          const localItem = projectsData.find(p => p.id === parseInt(id));
          if (localItem) {
            setProject(localItem);
            setActiveImage(localItem.images && localItem.images.length > 0 ? localItem.images[0] : localItem.image);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getDetails();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] pt-32 pb-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="mb-8">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="mb-10 space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-16 w-3/4 max-w-2xl" />
            <Skeleton className="h-6 w-full max-w-3xl" />
            <Skeleton className="h-6 w-5/6 max-w-2xl" />
          </div>
          <Skeleton className="w-full aspect-[21/9] rounded-[2rem] mb-12" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <div className="space-y-4">
                <Skeleton className="h-8 w-48 mb-6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
            <div className="space-y-8">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <div className="space-y-3">
                <Skeleton className="h-14 w-full rounded-2xl" />
                <Skeleton className="h-14 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] pt-32 pb-24 text-center">
        <div className="max-w-md mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Project Not Found</h2>
          <p className="text-zinc-400 mb-8">The project you are looking for does not exist or has been moved.</p>
          <Link to="/works" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] pt-32 pb-24 text-white relative overflow-hidden">
      {/* Background radial gradients for Vercel/Linear look */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-[20%] right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[180px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Back Link */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link 
            to="/works" 
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Projects
          </Link>
        </motion.div>

        {/* Header Section */}
        <div className="mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-zinc-400 text-sm font-medium mb-3"
          >
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>{new Date(project.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent"
          >
            {project.title}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-400 text-lg sm:text-xl leading-relaxed max-w-3xl"
          >
            {project.desc}
          </motion.p>
        </div>

        {/* Interactive Large Banner Image */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full aspect-[21/9] bg-zinc-950 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl mb-4 relative"
        >
          <AnimatePresence mode="wait">
            <motion.img 
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={activeImage} 
              alt={project.title} 
              className="w-full h-full object-cover" 
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f1a] via-transparent to-transparent opacity-85 pointer-events-none" />
        </motion.div>

        {/* Thumbnail Selector Gallery */}
        {project.images && project.images.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap gap-3 mb-12 py-2 border-b border-zinc-800/40 pb-6"
          >
            {project.images.map((imgUrl, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(imgUrl)}
                className={`relative aspect-[16/9] w-28 sm:w-36 rounded-xl overflow-hidden border transition-all duration-300 ${
                  activeImage === imgUrl 
                    ? 'border-blue-500 scale-[1.03] shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                    : 'border-white/5 opacity-60 hover:opacity-100 hover:border-white/20'
                }`}
              >
                <img src={imgUrl} alt={`${project.title} screenshot ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </motion.div>
        )}

        {/* Split Grid for Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content (Left Column) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Project Overview */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-3">Project Overview</h2>
              <p className="text-zinc-400 leading-relaxed text-base">
                This project represents a highly functional solution targeted at delivering modern utility and a first-rate experience. Built around rigorous technical architecture, it addresses critical workflows with simplicity and exceptional visual details. Every interface is modularized to ensure maximum reusability and speed.
              </p>
              <p className="text-zinc-400 leading-relaxed text-base">
                Underneath, the application runs on scalable configurations, ensuring secure authorization layers, clean D3 analytics charts where applicable, and dynamic integration channels with multiple API endpoints.
              </p>
            </motion.section>

            {/* Core Features */}
            {project.features && project.features.length > 0 && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-3">Core Features</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.features.map((feature, i) => (
                    <li key={i} className="flex gap-3 items-start bg-zinc-900/40 p-4 rounded-xl border border-white/5">
                      <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <span className="text-zinc-300 text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}
          </div>

          {/* Metadata & Actions (Right Column) */}
          <div className="space-y-8 lg:sticky lg:top-24 h-fit">
            
            {/* Tech Stack */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl"
            >
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-500" />
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span key={t} className="px-3 py-1.5 text-sm font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Quick CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex flex-col gap-3"
            >
              {project.live && (
                <a 
                  href={project.live} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/25 hover:scale-[1.02]"
                >
                  <ExternalLink className="w-5 h-5" /> Visit Live Site
                </a>
              )}
              {project.github && (
                <a 
                  href={project.github} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg hover:scale-[1.02]"
                >
                  <Github className="w-5 h-5" /> Source Code
                </a>
              )}
            </motion.div>
          </div>

        </div>

      </div>
    </div>
  );
}
