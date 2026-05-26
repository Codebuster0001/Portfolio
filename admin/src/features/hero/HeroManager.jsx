import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, Plus, X, Link2, Loader2, Upload, FileText, Trash2, Eye, 
  Image as ImageIcon, Video, File, Download, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useGetHeroQuery, useUpdateHeroMutation } from '../../store/apiSlice';
import axiosClient from '../../utils/axiosClient';

const GRADIENT_OPTIONS = ['blue-400', 'purple-500', 'pink-500', 'emerald-400', 'cyan-400', 'yellow-400', 'red-400', 'indigo-400'];

// Supported general upload extensions
const ALLOWED_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg',
  '.pdf', '.doc', '.docx', '.zip', '.rar', '.7z',
  '.txt', '.csv', '.mp4', '.mov', '.avi', '.mp3', '.wav'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB maximum

export default function HeroManager() {
  const { data: hero, isLoading } = useGetHeroQuery();
  const [updateHero, { isLoading: isSaving }] = useUpdateHeroMutation();

  const [form, setForm] = useState({
    name: '',
    role: '',
    description: '',
    availabilityStatus: '',
    techStack: [],
    gradientFrom: 'blue-400',
    gradientVia: 'purple-500',
    gradientTo: 'pink-500',
    githubUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    gmailAddress: '',
    profilePhoto: '',
    resumeUrl: '',
  });

  const [newTech, setNewTech] = useState('');
  const [saveStatus, setSaveStatus] = useState(''); // 'success' | 'error' | ''
  const [errorMessage, setErrorMessage] = useState('');

  // Individual Upload State Trackers
  const [photoUpload, setPhotoUpload] = useState({ progress: 0, loading: false, dragActive: false });
  const [resumeUpload, setResumeUpload] = useState({ progress: 0, loading: false, dragActive: false });

  useEffect(() => {
    if (hero) {
      setForm({
        name: hero.name || '',
        role: hero.role || '',
        description: hero.description || '',
        availabilityStatus: hero.availabilityStatus || '',
        techStack: hero.techStack || [],
        gradientFrom: hero.gradientFrom || 'blue-400',
        gradientVia: hero.gradientVia || 'purple-500',
        gradientTo: hero.gradientTo || 'pink-500',
        githubUrl: hero.githubUrl || '',
        linkedinUrl: hero.linkedinUrl || '',
        twitterUrl: hero.twitterUrl || '',
        instagramUrl: hero.instagramUrl || '',
        gmailAddress: hero.gmailAddress || '',
        profilePhoto: hero.profilePhoto || '',
        resumeUrl: hero.resumeUrl || '',
      });
    }
  }, [hero]);

  // Generic File Type Visual Finder
  const getFileIcon = (url) => {
    if (!url) return <File className="w-10 h-10 text-slate-400 dark:text-zinc-500" />;
    const cleanUrl = url.toLowerCase();

    if (cleanUrl.endsWith('.pdf')) {
      return <FileText className="w-10 h-10 text-red-400" />;
    }
    if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.avi')) {
      return <Video className="w-10 h-10 text-purple-400" />;
    }
    if (cleanUrl.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
      return <ImageIcon className="w-10 h-10 text-blue-400" />;
    }
    return <File className="w-10 h-10 text-slate-500 dark:text-zinc-400" />;
  };

  // Safe Deletion Action Trigger
  const handleRemoveFile = async (type) => {
    const targetUrl = type === 'photo' ? form.profilePhoto : form.resumeUrl;
    if (!targetUrl) return;

    try {
      // Fetch user token from localstorage
      const token = localStorage.getItem('admin_token');
      
      // Perform safe background deletion from Cloudinary via UploadController
      await axiosClient.delete(`/Upload/delete?url=${encodeURIComponent(targetUrl)}`);
      
      setForm(f => ({ ...f, [type === 'photo' ? 'profilePhoto' : 'resumeUrl']: '' }));
    } catch (err) {
      console.error('[CLOUDINARY DELETION ERROR]', err);
      // Hard delete from UI fallback if file doesn't exist on server anymore
      setForm(f => ({ ...f, [type === 'photo' ? 'profilePhoto' : 'resumeUrl']: '' }));
    }
  };

  // Perform Axios dynamic upload using progress trackers
  const performUpload = async (file, type) => {
    if (!file) return;

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`Upload failed. File exceeds the 50MB limit.`);
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    // Validate extension
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMessage(`Extension '${ext}' is not supported.`);
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    const stateSetter = type === 'photo' ? setPhotoUpload : setResumeUpload;
    stateSetter({ progress: 0, loading: true, dragActive: false });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosClient.post('/Upload/any', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          stateSetter(s => ({ ...s, progress: percentCompleted }));
        }
      });

      if (response.data?.url) {
        setForm(f => ({ ...f, [type === 'photo' ? 'profilePhoto' : 'resumeUrl']: response.data.url }));
      }
    } catch (err) {
      console.error('[UPLOAD FAIL]', err);
      setErrorMessage(err.response?.data?.message || 'File upload failed due to network error.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      stateSetter({ progress: 0, loading: false, dragActive: false });
    }
  };

  // Drag and drop event handlers
  const handleDrag = (e, type, active) => {
    e.preventDefault();
    e.stopPropagation();
    const stateSetter = type === 'photo' ? setPhotoUpload : setResumeUpload;
    stateSetter(s => ({ ...s, dragActive: active }));
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      performUpload(file, type);
    }
  };

  const handleSave = async () => {
    if (!hero?.id) return;
    try {
      await updateHero({ id: hero.id, ...form }).unwrap();
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const addTech = () => {
    if (newTech.trim() && !form.techStack.includes(newTech.trim())) {
      setForm(f => ({ ...f, techStack: [...f.techStack, newTech.trim()] }));
      setNewTech('');
    }
  };

  const removeTech = (tech) => {
    setForm(f => ({ ...f, techStack: f.techStack.filter(t => t !== tech) }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full mx-auto pb-12">
      
      {/* Header and Save Controls */}
      <div className="flex items-center justify-between bg-white/50 dark:bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Hero Landing Manager</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Configure your landing page, details, and media assets.</p>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {saveStatus === 'success' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                <CheckCircle className="w-4 h-4" /> Saved Successfully!
              </motion.div>
            )}
            {saveStatus === 'error' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full">
                <AlertTriangle className="w-4 h-4" /> Save Failed.
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/15"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-950/40 border border-red-800/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm font-semibold shadow-lg">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      {/* Hero Form Data */}
      <div className="bg-white/50 dark:bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Your Full Name</label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white" placeholder="Deepak Kushwaha" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Professional Role Title</label>
            <Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white" placeholder="Full Stack Engineer" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">About Description</label>
          <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white min-h-24" placeholder="Briefly describe your profile focus..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Availability Status</label>
            <Input value={form.availabilityStatus} onChange={e => setForm(f => ({ ...f, availabilityStatus: e.target.value }))} className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white" placeholder="Available for new opportunities" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2"><Link2 className="w-4 h-4" /> GitHub URL</label>
            <Input value={form.githubUrl} onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))} className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white" placeholder="https://github.com/..." />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2"><Link2 className="w-4 h-4" /> LinkedIn URL</label>
            <Input value={form.linkedinUrl} onChange={e => setForm(f => ({ ...f, linkedinUrl: e.target.value }))} className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white" placeholder="https://linkedin.com/in/..." />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2"><Link2 className="w-4 h-4" /> Twitter URL</label>
            <Input value={form.twitterUrl} onChange={e => setForm(f => ({ ...f, twitterUrl: e.target.value }))} className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white" placeholder="https://twitter.com/..." />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2"><Link2 className="w-4 h-4" /> Instagram URL</label>
            <Input value={form.instagramUrl} onChange={e => setForm(f => ({ ...f, instagramUrl: e.target.value }))} className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white" placeholder="https://instagram.com/..." />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2"><Link2 className="w-4 h-4" /> Gmail Address</label>
            <Input value={form.gmailAddress} onChange={e => setForm(f => ({ ...f, gmailAddress: e.target.value }))} className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white" placeholder="youremail@gmail.com" />
          </div>
        </div>
      </div>

      {/* --- Media & Assets --- */}
      <div className="bg-white/50 dark:bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Media & Assets Workspace</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Upload profile visuals, PDF resume documents, videos, zip folders, or archives to Cloudinary.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* PROFILE PHOTO BLOCK */}
          <div className={`bg-slate-50 dark:bg-zinc-950/40 rounded-xl p-5 border transition-all flex flex-col items-center text-center space-y-4 relative ${
            photoUpload.dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-slate-200 dark:border-white/5'
          }`}
            onDragEnter={(e) => handleDrag(e, 'photo', true)}
            onDragOver={(e) => handleDrag(e, 'photo', true)}
            onDragLeave={(e) => handleDrag(e, 'photo', false)}
            onDrop={(e) => handleDrop(e, 'photo')}
          >
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Profile Photo</h3>
            
            <div className="relative w-28 h-28 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-zinc-950/80 group">
              {form.profilePhoto ? (
                <>
                  <img src={form.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                    <button 
                      onClick={() => handleRemoveFile('photo')} 
                      className="p-1.5 rounded-full bg-red-600/80 hover:bg-red-600 text-white"
                      title="Delete from Cloudinary"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <a href={form.profilePhoto} target="_blank" rel="noreferrer" className="p-1.5 rounded-full bg-blue-600/80 hover:bg-blue-600 text-white" title="View Full">
                      <Eye className="w-4 h-4" />
                    </a>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500">
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-[10px]">Drag & Drop</span>
                </div>
              )}

              {photoUpload.loading && (
                <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-2">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin mb-1" />
                  <span className="text-[10px] text-zinc-300 font-bold">{photoUpload.progress}%</span>
                  <div className="w-[80%] h-1 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-blue-500" style={{ width: `${photoUpload.progress}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className="w-full">
              <label className="cursor-pointer block">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => performUpload(e.target.files?.[0], 'photo')} 
                  className="hidden" 
                  disabled={photoUpload.loading} 
                />
                <div className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  {photoUpload.loading ? 'Uploading Image...' : 'Choose Image'}
                </div>
              </label>
            </div>
            
            {form.profilePhoto && (
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono truncate w-full px-2" title={form.profilePhoto}>
                {form.profilePhoto}
              </p>
            )}
          </div>

          {/* DYNAMIC RESUME FILE BLOCK (SUPPORT ALL FILE TYPES) */}
          <div className={`bg-slate-50 dark:bg-zinc-950/40 rounded-xl p-5 border transition-all flex flex-col items-center text-center space-y-4 relative ${
            resumeUpload.dragActive ? 'border-purple-500 bg-purple-500/5' : 'border-slate-200 dark:border-white/5'
          }`}
            onDragEnter={(e) => handleDrag(e, 'resume', true)}
            onDragOver={(e) => handleDrag(e, 'resume', true)}
            onDragLeave={(e) => handleDrag(e, 'resume', false)}
            onDrop={(e) => handleDrop(e, 'resume')}
          >
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Resume / Custom File</h3>
            
            <div className="relative w-28 h-28 rounded-xl border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-zinc-950/80 group">
              {form.resumeUrl ? (
                <div className="flex flex-col items-center justify-center">
                  {getFileIcon(form.resumeUrl)}
                  <span className="text-[9px] text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider mt-1.5 truncate max-w-[90px]">
                    {form.resumeUrl.split('/').pop().split('?')[0]}
                  </span>
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                    <button 
                      onClick={() => handleRemoveFile('resume')} 
                      className="p-1.5 rounded-full bg-red-600/80 hover:bg-red-600 text-white"
                      title="Delete from Cloudinary"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <a 
                      href={form.resumeUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-1.5 rounded-full bg-emerald-600/80 hover:bg-emerald-600 text-white" 
                      title="View / Download File"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500">
                  <File className="w-6 h-6 mb-1" />
                  <span className="text-[10px]">Drag & Drop File</span>
                </div>
              )}

              {resumeUpload.loading && (
                <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-2">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin mb-1" />
                  <span className="text-[10px] text-zinc-300 font-bold">{resumeUpload.progress}%</span>
                  <div className="w-[80%] h-1 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-purple-500" style={{ width: `${resumeUpload.progress}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className="w-full">
              <label className="cursor-pointer block">
                <Input 
                  type="file" 
                  onChange={e => performUpload(e.target.files?.[0], 'resume')} 
                  className="hidden" 
                  disabled={resumeUpload.loading} 
                />
                <div className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  {resumeUpload.loading ? 'Uploading File...' : 'Choose File'}
                </div>
              </label>
            </div>

            {form.resumeUrl && (
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono truncate w-full px-2" title={form.resumeUrl}>
                {form.resumeUrl}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* --- Technical Expertise --- */}
      <div className="bg-white/50 dark:bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Technical Expertise & Skills</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Add or manage key engineering keywords displayed on your landing page.</p>
        </div>
        <div className="flex gap-2">
          <Input value={newTech} onChange={e => setNewTech(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTech()} className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white" placeholder="Add skill (e.g. Next.js, QuestPDF)" />
          <Button onClick={addTech} className="bg-slate-100 dark:bg-zinc-800 hover:bg-zinc-700 text-white font-semibold flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add</Button>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {form.techStack.map(tech => (
            <span key={tech} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold">
              {tech}
              <button onClick={() => removeTech(tech)} className="text-slate-400 dark:text-zinc-500 hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      </div>

      {/* --- Gradient Colors --- */}
      <div className="bg-white/50 dark:bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Name Gradient Colors</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Choose the gradient colors for your name highlight.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['gradientFrom', 'gradientVia', 'gradientTo']).map((key) => (
            <div key={key} className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider capitalize">{key.replace('gradient', '')}</label>
              <div className="flex flex-wrap gap-2">
                {GRADIENT_OPTIONS.map(color => (
                  <button
                    key={color}
                    onClick={() => setForm(f => ({ ...f, [key]: color }))}
                    className={`w-7 h-7 rounded-full border-2 transition-all bg-${color} ${form[key] === color ? 'border-white scale-110' : 'border-transparent hover:border-zinc-500'}`}
                    title={color}
                  />
                ))}
              </div>
              <p className="text-xs text-zinc-600 font-mono">{form[key]}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
