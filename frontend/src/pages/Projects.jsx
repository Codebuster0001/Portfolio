import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, ExternalLink, ArrowRight, Code2 } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from '@/components/ui/button';
import { projectsData } from '../data/projects';
import { Skeleton } from '../components/ui/Skeleton';

import axiosClient from '../utils/axiosClient';

export default function Projects() { 
  const [projects, setProjects] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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
        console.warn('[PROJECTS API] Offline or error. Falling back to local static data.', err);
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

  const featuredProjects = projects.slice(0, 6);

  return (
    <div className='py-24 w-full relative'>
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] opacity-50" />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-700/50 bg-zinc-800/30 text-zinc-300 text-sm font-medium backdrop-blur-md mb-4">
              <Code2 className="w-4 h-4 text-blue-400" />
              Portfolio
            </div>
            <h2 className='text-3xl md:text-5xl font-bold tracking-tight text-white mb-4'>
              Featured <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Projects</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl text-lg">
              A selection of my recent work. Explore my full portfolio to see more complex applications and open-source contributions.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Button asChild className="rounded-full bg-white text-zinc-950 hover:bg-zinc-200 px-6 h-12 text-base font-semibold group transition-all hover:scale-105">
              <Link to="/works">
                View All Projects
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 md:-ml-6 py-4 min-h-[450px]">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <CarouselItem key={`skeleton-${index}`} className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
                    <div className='bg-zinc-900/60 border border-white/10 p-6 rounded-[2rem] h-[400px] flex flex-col backdrop-blur-xl'>
                      <Skeleton className="h-52 w-full rounded-2xl mb-6" />
                      <Skeleton className="h-8 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-5/6 flex-grow mb-6" />
                      <div className="flex gap-2 mt-auto">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </CarouselItem>
                ))
              ) : (
                featuredProjects.map((project, index) => (
                  <CarouselItem key={project.id} className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
                    <motion.div 
                      whileHover={{ y: -8 }}
                      className='bg-zinc-900/60 border border-white/10 p-6 rounded-[2rem] h-[400px] flex flex-col hover:border-blue-500/50 transition-all duration-500 backdrop-blur-xl group'
                    >
                      {/* Project Image */}
                      <div className='h-52 shrink-0 bg-zinc-800 rounded-2xl mb-6 overflow-hidden relative border border-white/5'>
                        <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60"></div>
                        
                        {/* Action buttons overlay */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 translate-y-[-10px] group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          <a href={project.github} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-zinc-950/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-blue-600 hover:scale-110 transition-all">
                            <Github className="w-5 h-5" />
                          </a>
                          <a href={project.live} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-zinc-950/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-blue-600 hover:scale-110 transition-all">
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                      
                      {/* Project Info */}
                      <h3 className='text-2xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors'>{project.title}</h3>
                      <p className='text-zinc-400 text-sm flex-grow mb-6 leading-relaxed line-clamp-3'>{project.desc}</p>
                      
                      {/* Tech Stack Badges */}
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {project.tech.slice(0, 3).map((t, i) => (
                          <span key={i} className="px-3 py-1 text-xs font-medium text-zinc-300 bg-zinc-800/50 border border-zinc-700/50 rounded-lg backdrop-blur-sm">
                            {t}
                          </span>
                        ))}
                        {project.tech.length > 3 && (
                          <span className="px-3 py-1 text-xs font-medium text-zinc-400 bg-zinc-800/20 border border-zinc-800/50 rounded-lg backdrop-blur-sm">
                            +{project.tech.length - 3}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
            
            {/* Carousel Controls */}
            <div className="flex justify-end gap-3 mt-10 mr-2">
              <CarouselPrevious className="static translate-y-0 h-12 w-12 border-zinc-700 bg-zinc-900/80 backdrop-blur-md hover:bg-white hover:text-zinc-950 transition-colors" />
              <CarouselNext className="static translate-y-0 h-12 w-12 border-zinc-700 bg-zinc-900/80 backdrop-blur-md hover:bg-white hover:text-zinc-950 transition-colors" />
            </div>
          </Carousel>
        </motion.div>
      </div>
    </div>
  ) 
}
