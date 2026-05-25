import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, ExternalLink, GitBranch, Edit2, Trash2, 
  Calendar, Clock, LayoutTemplate, Layers, AlertCircle, Loader2
} from 'lucide-react';
import { useGetProjectByIdQuery, useDeleteProjectMutation } from '../store/apiSlice';
import { useToast } from '../components/ui/Toast';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const { data: project, isLoading, error } = useGetProjectByIdQuery(id);
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-slate-400 dark:text-zinc-500 font-medium">Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Project Not Found</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm">The project you're looking for doesn't exist or an error occurred.</p>
        </div>
        <button 
          onClick={() => navigate('/projects')}
          className="mt-4 px-6 py-2 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-white rounded-xl transition-colors text-sm font-medium flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${project.title}?`)) {
      try {
        await deleteProject(id).unwrap();
        addToast('Project deleted successfully', 'success');
        navigate('/projects');
      } catch (err) {
        addToast('Failed to delete project', 'error');
      }
    }
  };

  const statusColors = {
    'Live': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Planned': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Completed': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    'Archived': 'bg-zinc-500/10 text-slate-500 dark:text-zinc-400 border-zinc-500/20',
  };

  const statusColor = statusColors[project.status] || statusColors['Planned'];

  return (
    <div className="space-y-8 pb-12 w-full max-w-[1600px] mx-auto">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 dark:bg-white dark:bg-zinc-900/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-md">
        <button 
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white transition-colors group"
        >
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">Back to Projects</span>
        </button>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-colors text-sm font-medium border border-blue-500/20"
          >
            <Edit2 className="w-4 h-4" /> Edit Project
          </button>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors text-sm font-medium border border-red-500/20 disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>

      {/* Hero Banner Area */}
      <div className="relative w-full h-[400px] rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 group bg-slate-50 dark:bg-zinc-950">
        {project.imageUrl ? (
          <img 
            src={project.imageUrl} 
            alt={project.title} 
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
            <LayoutTemplate className="w-24 h-24 text-zinc-800 mb-4" />
            <span className="text-zinc-600 font-medium">No Image Provided</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        
        {/* Banner Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColor}`}>
              {project.status || 'Planned'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-zinc-300 border border-zinc-700">
              {project.category || 'Uncategorized'}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            {project.title}
          </h1>
          
          <div className="flex flex-wrap gap-4 text-sm text-zinc-300">
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-md">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
            {project.updatedAt && (
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-md">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Description & Tech */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="bg-white/50 dark:bg-white dark:bg-zinc-900/50 backdrop-blur-md rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <LayoutTemplate className="w-5 h-5 text-blue-400" />
              About Project
            </h2>
            <div className="prose prose-invert prose-zinc max-w-none">
              {project.description ? (
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{project.description}</p>
              ) : (
                <p className="text-slate-400 dark:text-zinc-500 italic">No description provided for this project.</p>
              )}
            </div>
          </div>

          {/* Key Features (if any) */}
          {project.features && project.features.length > 0 && (
            <div className="bg-white/50 dark:bg-white dark:bg-zinc-900/50 backdrop-blur-md rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <Layers className="w-5 h-5 text-purple-400" />
                Key Features
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-zinc-950/50 rounded-2xl border border-slate-200 dark:border-zinc-800/50">
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold">{idx + 1}</span>
                    </div>
                    <span className="text-zinc-300 text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Links & Tech Stack */}
        <div className="space-y-8">
          {/* Action Links */}
          <div className="bg-white/50 dark:bg-white dark:bg-zinc-900/50 backdrop-blur-md rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Links & Resources</h3>
            <div className="space-y-4">
              {project.liveUrl ? (
                <a 
                  href={project.liveUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] group"
                >
                  <span className="font-semibold">View Live Project</span>
                  <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              ) : (
                <div className="flex items-center justify-between p-4 bg-slate-100/50 dark:bg-slate-100 dark:bg-zinc-800/50 text-slate-400 dark:text-zinc-500 rounded-2xl border border-zinc-700/50 cursor-not-allowed">
                  <span className="font-semibold">No Live Link</span>
                  <ExternalLink className="w-5 h-5" />
                </div>
              )}
              
              {project.githubUrl ? (
                <a 
                  href={project.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-slate-100 dark:bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl transition-colors border border-slate-200 dark:border-white/5 group"
                >
                  <span className="font-semibold">View Source Code</span>
                  <GitBranch className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              ) : (
                <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-white dark:bg-zinc-900/50 text-zinc-600 rounded-2xl border border-slate-200 dark:border-white/5 cursor-not-allowed">
                  <span className="font-semibold">No Source Code</span>
                  <GitBranch className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="bg-white/50 dark:bg-white dark:bg-zinc-900/50 backdrop-blur-md rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Technologies Used</h3>
            {project.technologies && project.technologies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-300 font-mono shadow-inner"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 dark:text-zinc-500 italic text-sm">No technologies specified.</p>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
