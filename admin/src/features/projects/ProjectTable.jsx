import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetProjectsQuery } from '../../store/apiSlice';
import { Skeleton } from '@/components/ui/Skeleton';

export default React.memo(function ProjectTable() {
  const navigate = useNavigate();
  const { data: projectsData, isLoading, error } = useGetProjectsQuery();
  const projects = Array.isArray(projectsData) ? projectsData : projectsData?.$values || [];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white/50 dark:bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl min-h-[450px] flex flex-col"
    >
      <div className="p-6 border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Projects</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">View your portfolio projects</p>
        </div>
        <button 
          onClick={() => navigate('/projects')}
          className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center gap-1 group"
        >
          View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-500 dark:text-zinc-400">
          <thead className="text-xs uppercase bg-slate-50 dark:bg-zinc-950/50 text-slate-400 dark:text-zinc-500 border-b border-slate-200 dark:border-white/5">
            <tr>
              <th className="px-6 py-4 font-semibold">Project Name</th>
              <th className="px-6 py-4 font-semibold">Tech Stack</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-6 py-4"><Skeleton className="h-4 w-3/4" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-1/2" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-6 ml-auto" /></td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-red-400">
                  Failed to load projects.
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-400 dark:text-zinc-500">
                  No projects found.
                </td>
              </tr>
            ) : (
              projects.slice(0, 5).map((project, idx) => (
                <motion.tr 
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + idx * 0.1 }}
                  className="hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{project.title}</td>
                  <td className="px-6 py-4 font-mono text-xs text-purple-400">
                    {project.technologies?.slice(0, 3).join(', ') || 'None'}
                    {project.technologies?.length > 3 && '...'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      project.status === 'Live' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      project.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-zinc-500/10 text-slate-500 dark:text-zinc-400 border-zinc-500/20'
                    }`}>
                      {project.status || 'Planned'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(project.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {project.liveUrl && (
                        <a 
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
});
