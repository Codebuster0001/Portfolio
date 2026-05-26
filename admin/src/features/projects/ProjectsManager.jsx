import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Trash2, Edit2, FolderKanban, Globe, X, Eye, Loader2, Sparkles, Image as ImageIcon, CheckCircle, AlertTriangle, Calendar, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation
} from '../../store/apiSlice';
import axiosClient from '../../utils/axiosClient';

// Bulletproof self-contained Github icon to avoid lucide-react version export mismatches
const GithubIcon = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    width="24" 
    height="24" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={props.className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function ProjectsManager() {
  const { data: projects, isLoading: projectsLoading, refetch } = useGetProjectsQuery();
  const [createProject, { isLoading: creating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: updating }] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  // Mode state: 'list' or 'form'
  const [mode, setMode] = useState('list'); 
  const [editingId, setEditingId] = useState(null);

  // Search, Filter, Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [featuredFilter, setFeaturedFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');

  // Extract unique categories dynamically
  const categories = React.useMemo(() => {
    if (!projects) return ['All'];
    const cats = new Set();
    projects.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return ['All', ...Array.from(cats).sort()];
  }, [projects]);

  // Filtered and sorted projects
  const filteredProjects = React.useMemo(() => {
    if (!projects) return [];
    
    let result = [...projects];

    // 1. Search Query (Title, Description, or Tech Stack)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.title || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.techStack || []).some(t => t.toLowerCase().includes(q))
      );
    }

    // 2. Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // 3. Featured Filter
    if (featuredFilter === 'featured') {
      result = result.filter(p => p.isFeatured);
    } else if (featuredFilter === 'regular') {
      result = result.filter(p => !p.isFeatured);
    }

    // 4. Sort Order
    result.sort((a, b) => {
      if (sortOrder === 'newest') {
        const dateA = a.projectDate ? new Date(a.projectDate).getTime() : 0;
        const dateB = b.projectDate ? new Date(b.projectDate).getTime() : 0;
        return dateB - dateA;
      } else if (sortOrder === 'oldest') {
        const dateA = a.projectDate ? new Date(a.projectDate).getTime() : 0;
        const dateB = b.projectDate ? new Date(b.projectDate).getTime() : 0;
        return dateA - dateB;
      } else if (sortOrder === 'alpha-asc') {
        return (a.title || '').localeCompare(b.title || '');
      } else if (sortOrder === 'alpha-desc') {
        return (b.title || '').localeCompare(a.title || '');
      }
      return 0;
    });

    return result;
  }, [projects, searchQuery, selectedCategory, featuredFilter, sortOrder]);

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    techStack: [],
    mainImage: '',
    projectImages: [],
    projectDate: '',
    features: [],
    githubUrl: '',
    liveUrl: '',
    category: '',
    isFeatured: false
  });

  // UI inputs
  const [newTech, setNewTech] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Upload States
  const [mainUpload, setMainUpload] = useState({ loading: false, progress: 0, dragActive: false });
  const [screenshotUpload, setScreenshotUpload] = useState({ loading: false, progress: 0, dragActive: false });

  // Clear messages
  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  // Open Form for Adding
  const handleAddNew = () => {
    setForm({
      title: '',
      description: '',
      techStack: [],
      mainImage: '',
      projectImages: [],
      projectDate: '',
      features: [],
      githubUrl: '',
      liveUrl: '',
      category: '',
      isFeatured: false
    });
    setEditingId(null);
    setMode('form');
  };

  // Open Form for Editing
  const handleEdit = (proj) => {
    // Format date properly for HTML input (YYYY-MM-DD)
    let formattedDate = '';
    if (proj.projectDate) {
      formattedDate = new Date(proj.projectDate).toISOString().split('T')[0];
    }
    setForm({
      title: proj.title || '',
      description: proj.description || '',
      techStack: proj.techStack || [],
      mainImage: proj.mainImage || '',
      projectImages: proj.projectImages || [],
      projectDate: formattedDate,
      features: proj.features || [],
      githubUrl: proj.githubUrl || '',
      liveUrl: proj.liveUrl || '',
      category: proj.category || '',
      isFeatured: proj.isFeatured || false
    });
    setEditingId(proj.id);
    setMode('form');
  };

  // Tech stack handlers
  const addTech = () => {
    if (newTech.trim() && !form.techStack.includes(newTech.trim())) {
      setForm(f => ({ ...f, techStack: [...f.techStack, newTech.trim()] }));
      setNewTech('');
    }
  };
  const removeTech = (tech) => {
    setForm(f => ({ ...f, techStack: f.techStack.filter(t => t !== tech) }));
  };

  // Features handlers
  const addFeature = () => {
    if (newFeature.trim() && !form.features.includes(newFeature.trim())) {
      setForm(f => ({ ...f, features: [...f.features, newFeature.trim()] }));
      setNewFeature('');
    }
  };
  const removeFeature = (feat) => {
    setForm(f => ({ ...f, features: f.features.filter(x => x !== feat) }));
  };

  // Upload Logic
  const performUpload = async (file, isMain) => {
    if (!file) return;

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      showError(`File exceeds 50MB size limit.`);
      return;
    }

    // Validate extension
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      showError(`File type '${ext}' is not supported.`);
      return;
    }

    const stateSetter = isMain ? setMainUpload : setScreenshotUpload;
    stateSetter({ progress: 0, loading: true, dragActive: false });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axiosClient.post('Upload/any', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          stateSetter(s => ({ ...s, progress: percentCompleted }));
        }
      });

      if (res.data?.url) {
        if (isMain) {
          setForm(f => ({ ...f, mainImage: res.data.url }));
        } else {
          setForm(f => ({ ...f, projectImages: [...f.projectImages, res.data.url] }));
        }
        showSuccess('File uploaded to Cloudinary successfully!');
      }
    } catch (err) {
      console.error('[CLOUD UPLOAD FAIL]', err);
      showError(err.response?.data?.message || 'File upload failed due to network or server error.');
    } finally {
      stateSetter({ progress: 0, loading: false, dragActive: false });
    }
  };

  // Drag handles
  const handleDrag = (e, isMain, active) => {
    e.preventDefault();
    e.stopPropagation();
    const stateSetter = isMain ? setMainUpload : setScreenshotUpload;
    stateSetter(s => ({ ...s, dragActive: active }));
  };

  const handleDrop = (e, isMain) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      performUpload(file, isMain);
    }
  };

  // Save changes
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return showError('Project Title is required.');
    if (!form.description.trim()) return showError('Project Description is required.');
    if (!form.mainImage) return showError('Main Project Image is required.');

    try {
      // Parse date to ISO or null
      const requestBody = {
        ...form,
        projectDate: form.projectDate ? new Date(form.projectDate).toISOString() : null
      };

      if (editingId) {
        await updateProject({ id: editingId, ...requestBody }).unwrap();
        showSuccess('Project updated successfully!');
      } else {
        await createProject(requestBody).unwrap();
        showSuccess('Project created successfully!');
      }
      setMode('list');
      refetch();
    } catch (err) {
      showError(err.data?.message || err.message || 'Failed to save project changes.');
    }
  };

  // Delete project
  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this project?')) return;
    try {
      await deleteProject(id).unwrap();
      showSuccess('Project deleted.');
      refetch();
    } catch (err) {
      showError('Failed to delete project.');
    }
  };

  return (
    <div className="space-y-6 w-full mx-auto pb-12">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white/50 dark:bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FolderKanban className="w-6 h-6 text-blue-500" />
            Project Portfolio Manager
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Add, edit, or delete projects listed on your public website.</p>
        </div>
        {mode === 'list' ? (
          <Button 
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/15"
          >
            <Plus className="w-4 h-4" /> Add New Project
          </Button>
        ) : (
          <Button 
            onClick={() => setMode('list')}
            variant="outline"
            className="border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:bg-zinc-800 text-white rounded-full px-6 font-semibold"
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Dynamic banners */}
      <AnimatePresence>
        {successMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-sm text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl">
            <CheckCircle className="w-5 h-5" /> {successMessage}
          </motion.div>
        )}
        {errorMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-sm text-red-400 font-semibold bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
            <AlertTriangle className="w-5 h-5" /> {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render Lists */}
      {mode === 'list' && (
        <div className="space-y-6">
          {/* Search, Filter & Sort Controls Panel */}
          {!projectsLoading && projects && projects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-white dark:bg-zinc-900/30 border border-slate-200 dark:border-white/5 rounded-2xl backdrop-blur-xl">
              {/* Search Input */}
              <div className="sm:col-span-4 relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 group-focus-within:text-blue-400 transition-colors">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-xl py-2.5 pl-9 pr-4 text-xs text-zinc-100 placeholder:text-slate-400 dark:text-zinc-500 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                />
              </div>

              {/* Category Dropdown */}
              <div className="sm:col-span-3 relative">
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-xl py-2.5 pl-3 pr-8 text-xs text-zinc-300 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-slate-50 dark:bg-zinc-950 text-white">
                      {cat === 'All' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-zinc-500">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Featured filter */}
              <div className="sm:col-span-2 relative">
                <select
                  value={featuredFilter}
                  onChange={e => setFeaturedFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-xl py-2.5 pl-3 pr-8 text-xs text-zinc-300 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="All" className="bg-slate-50 dark:bg-zinc-950 text-white">All Statuses</option>
                  <option value="featured" className="bg-slate-50 dark:bg-zinc-950 text-white">Featured Only</option>
                  <option value="regular" className="bg-slate-50 dark:bg-zinc-950 text-white">Regular Only</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-zinc-500">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="sm:col-span-3 relative">
                <select
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-xl py-2.5 pl-3 pr-8 text-xs text-zinc-300 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="newest" className="bg-slate-50 dark:bg-zinc-950 text-white">Newest First</option>
                  <option value="oldest" className="bg-slate-50 dark:bg-zinc-950 text-white">Oldest First</option>
                  <option value="alpha-asc" className="bg-slate-50 dark:bg-zinc-950 text-white">Title A-Z</option>
                  <option value="alpha-desc" className="bg-slate-50 dark:bg-zinc-950 text-white">Title Z-A</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-zinc-500">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          )}

          {projectsLoading ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="text-slate-400 dark:text-zinc-500 text-sm">Fetching projects...</span>
            </div>
          ) : !projects || projects.length === 0 ? (
            <div className="text-center py-20 border border-slate-200 dark:border-white/5 rounded-2xl bg-white dark:bg-zinc-900/25">
              <FolderKanban className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No projects found</h3>
              <p className="text-slate-400 dark:text-zinc-500 text-sm mt-1 max-w-xs mx-auto">Create your very first portfolio project using the button above.</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20 border border-slate-200 dark:border-white/5 rounded-2xl bg-white dark:bg-zinc-900/25">
              <Search className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No matching projects found</h3>
              <p className="text-slate-400 dark:text-zinc-500 text-sm mt-1 max-w-xs mx-auto">Try refining your search query, category, or status filter.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredProjects.map((proj) => (
                <motion.div 
                  layout
                  key={proj.id} 
                  className="bg-white dark:bg-zinc-900/40 backdrop-blur-md border border-slate-200 dark:border-white/5 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-200 dark:border-zinc-800/85 hover:bg-white dark:bg-zinc-900/60 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Compact Image */}
                    <div className="w-14 h-14 rounded-lg bg-slate-50 dark:bg-zinc-950 overflow-hidden relative shrink-0 border border-slate-200 dark:border-white/5">
                      <img src={proj.mainImage} alt={proj.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                    </div>

                    {/* Title and details */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-400 transition-colors leading-tight truncate">{proj.title}</h3>
                        {proj.isFeatured && (
                          <span className="bg-gradient-to-r from-blue-500/15 to-purple-500/15 border border-blue-500/20 text-blue-300 text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Sparkles className="w-2 h-2" /> Featured
                          </span>
                        )}
                        {proj.category && (
                          <span className="bg-zinc-850/80 text-slate-500 dark:text-zinc-400 text-[9px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/5">
                            {proj.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[#64748B] dark:text-zinc-400 text-[11px] line-clamp-1 leading-relaxed max-w-xl pr-2">{proj.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {proj.techStack?.slice(0, 5).map((tech, i) => (
                          <span key={i} className="px-2 py-0.5 text-[9px] font-semibold text-[#64748B] dark:text-zinc-300 bg-[#F1F5F9] dark:bg-zinc-800 rounded-md border border-[#E2E8F0] dark:border-white/5 transition-all">
                            {tech}
                          </span>
                        ))}
                        {proj.techStack?.length > 5 && (
                          <span className="px-1.5 py-0.5 text-[9px] text-slate-400 dark:text-zinc-500 font-semibold bg-slate-50 dark:bg-zinc-950 rounded">
                            +{proj.techStack.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button 
                      onClick={() => handleEdit(proj)}
                      className="border border-slate-300 dark:border-[#27272a] bg-[#FCFCFD] dark:bg-[#111217] text-[#0F172A] dark:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-[11px] font-semibold h-8 px-3 gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit details
                    </Button>
                    <Button 
                      onClick={() => handleDelete(proj.id)}
                      variant="destructive"
                      className="bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-400 rounded-lg h-8 w-8 p-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Render Upsert Form */}
      {mode === 'form' && (
        <form onSubmit={handleSave} className="bg-white/50 dark:bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Project Specifications' : 'Enter New Project Details'}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Col - Standard info */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Project Title <span className="text-red-500">*</span></label>
                <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white" placeholder="e.g. Stripe E-Commerce Suite" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Category</label>
                  <Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white" placeholder="e.g. Web App, Mobile" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-mono">Date</label>
                  <Input type="date" value={form.projectDate} onChange={e => setForm({...form, projectDate: e.target.value})} className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Description <span className="text-red-500">*</span></label>
                <Textarea rows={6} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white leading-relaxed" placeholder="Detailed architectural and capability description of this software solution..." required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1"><GithubIcon className="w-3.5 h-3.5" /> GitHub Url</label>
                  <Input value={form.githubUrl} onChange={e => setForm({...form, githubUrl: e.target.value})} className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white" placeholder="https://github.com/user/repo" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> Live Site Url</label>
                  <Input value={form.liveUrl} onChange={e => setForm({...form, liveUrl: e.target.value})} className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white" placeholder="https://yourproject.com" />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-white/5">
                <input 
                  type="checkbox" 
                  id="featured" 
                  checked={form.isFeatured} 
                  onChange={e => setForm({...form, isFeatured: e.target.checked})}
                  className="w-4 h-4 rounded border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-900" 
                />
                <label htmlFor="featured" className="text-sm font-semibold text-slate-900 dark:text-white cursor-pointer select-none">
                  Display as Featured Project (Promoted to Landing Page Carousel)
                </label>
              </div>
            </div>

            {/* Right Col - Media and tag management */}
            <div className="space-y-6">
              
              {/* Main Banner Image Dropzone */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  Main Project image <span className="text-red-500">*</span>
                </label>

                {form.mainImage ? (
                  <div className="h-44 rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden relative group">
                    <img src={form.mainImage} className="w-full h-full object-cover" alt="Main banner preview" />
                    <button 
                      type="button"
                      onClick={() => setForm({...form, mainImage: ''})}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/80 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onDragOver={e => handleDrag(e, true, true)}
                    onDragLeave={e => handleDrag(e, true, false)}
                    onDrop={e => handleDrop(e, true)}
                    className={`h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer ${
                      mainUpload.dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/50 hover:border-zinc-700'
                    }`}
                  >
                    {mainUpload.loading ? (
                      <div className="space-y-2.5">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                        <p className="text-xs text-slate-500 dark:text-zinc-400">Uploading banner to Cloudinary... ({mainUpload.progress}%)</p>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-slate-400 dark:text-zinc-500 mb-2" />
                        <p className="text-xs text-zinc-300 font-medium">Drag & Drop main image here, or</p>
                        <label className="text-xs text-blue-400 hover:text-blue-300 underline font-semibold mt-1 cursor-pointer">
                          browse file
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={e => performUpload(e.target.files?.[0], true)} 
                          />
                        </label>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Screenshots Array */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  Project screenshot gallery
                </label>

                {/* Grid of uploaded screenshots */}
                {form.projectImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {form.projectImages.map((img, i) => (
                      <div key={i} className="aspect-video bg-slate-50 dark:bg-zinc-950 rounded-lg overflow-hidden relative group border border-slate-200 dark:border-white/5">
                        <img src={img} className="w-full h-full object-cover" alt={`Screenshot ${i}`} />
                        <button 
                          type="button"
                          onClick={() => setForm({...form, projectImages: form.projectImages.filter((_, idx) => idx !== i)})}
                          className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dropzone for screens */}
                <div 
                  onDragOver={e => handleDrag(e, false, true)}
                  onDragLeave={e => handleDrag(e, false, false)}
                  onDrop={e => handleDrop(e, false)}
                  className={`h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    screenshotUpload.dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/20 hover:border-zinc-700'
                  }`}
                >
                  {screenshotUpload.loading ? (
                    <div className="space-y-1">
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin mx-auto" />
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400">Uploading screen... ({screenshotUpload.progress}%)</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400">Drag & Drop additional screenshots, or</p>
                      <label className="text-[10px] text-blue-400 hover:text-blue-300 underline font-semibold mt-1 cursor-pointer">
                        add screen
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={e => performUpload(e.target.files?.[0], false)} 
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>

              {/* Tech Stack tags */}
              <div className="space-y-3 bg-slate-50 dark:bg-zinc-950/50 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Tech Stack Tags</label>
                <div className="flex gap-2">
                  <Input 
                    value={newTech} 
                    onChange={e => setNewTech(e.target.value)} 
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
                    className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white h-9" 
                    placeholder="Press Enter to add tag (e.g. Redux)" 
                  />
                  <Button type="button" onClick={addTech} className="bg-slate-100 dark:bg-zinc-800 hover:bg-zinc-750 text-white h-9">Add</Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.techStack.map((tech) => (
                    <span key={tech} className="px-2.5 py-1 text-xs font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-1.5">
                      {tech}
                      <X className="w-3.5 h-3.5 cursor-pointer hover:text-red-400" onClick={() => removeTech(tech)} />
                    </span>
                  ))}
                </div>
              </div>

              {/* Core Features list */}
              <div className="space-y-3 bg-slate-50 dark:bg-zinc-950/50 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Core Features Bullets</label>
                <div className="flex gap-2">
                  <Input 
                    value={newFeature} 
                    onChange={e => setNewFeature(e.target.value)} 
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                    className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white h-9" 
                    placeholder="Add bullet (e.g. Real-time websocket sync)" 
                  />
                  <Button type="button" onClick={addFeature} className="bg-slate-100 dark:bg-zinc-800 hover:bg-zinc-750 text-white h-9">Add</Button>
                </div>
                <div className="space-y-2">
                  {form.features.map((feat) => (
                    <div key={feat} className="text-xs text-zinc-300 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 p-2.5 rounded-lg flex justify-between items-center">
                      <span className="leading-relaxed pr-2">{feat}</span>
                      <X className="w-4 h-4 shrink-0 text-slate-400 dark:text-zinc-500 hover:text-red-400 cursor-pointer" onClick={() => removeFeature(feat)} />
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          <div className="flex gap-3 justify-end pt-6 border-t border-slate-200 dark:border-white/5">
            <Button 
              type="button"
              onClick={() => setMode('list')}
              variant="outline"
              className="border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-[#0F172A] dark:text-zinc-100 rounded-full px-6 font-semibold transition-all focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={creating || updating}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {creating || updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? 'Save Specs' : 'Publish Project'}
            </Button>
          </div>
        </form>
      )}

    </div>
  );
}
