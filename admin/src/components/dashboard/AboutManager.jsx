import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  useGetAboutContentQuery, 
  useUpdateAboutContentMutation,
  useGetAboutSkillsQuery,
  useAddAboutSkillMutation,
  useDeleteAboutSkillMutation,
  useGetStatsQuery,
  useAddStatMutation,
  useDeleteStatMutation
} from '../../store/apiSlice';
import { useToast } from '../ui/Toast';

export default function AboutManager() {
  const { addToast } = useToast();
  // About Content State
  const { data: aboutContent, isLoading: contentLoading } = useGetAboutContentQuery();
  const [updateContent, { isLoading: updatingContent }] = useUpdateAboutContentMutation();

  const [contentForm, setContentForm] = useState({ title: '', subtitle: '', description: '' });

  useEffect(() => {
    if (aboutContent) {
      setContentForm({
        title: aboutContent.title || '',
        subtitle: aboutContent.subtitle || '',
        description: aboutContent.description || ''
      });
    }
  }, [aboutContent]);

  const handleSaveContent = async () => {
    try {
      await updateContent({ id: aboutContent.id, ...contentForm }).unwrap();
      addToast('About Content saved!', 'success');
    } catch (err) {
      addToast('Failed to save About Content.', 'error');
    }
  };

  // About Skills State
  const { data: skills } = useGetAboutSkillsQuery();
  const [addSkill] = useAddAboutSkillMutation();
  const [deleteSkill] = useDeleteAboutSkillMutation();

  const [newSkill, setNewSkill] = useState({ title: '', description: '', icon: '' });

  const handleAddSkill = async () => {
    if (!newSkill.title) return;
    try {
      await addSkill(newSkill).unwrap();
      setNewSkill({ title: '', description: '', icon: '' });
      addToast('Skill added!', 'success');
    } catch (err) {
      addToast('Failed to add skill.', 'error');
    }
  };

  // Stats State
  const { data: stats } = useGetStatsQuery();
  const [addStat] = useAddStatMutation();
  const [deleteStat] = useDeleteStatMutation();

  const [newStat, setNewStat] = useState({ label: '', value: 0, suffix: '', icon: '' });

  const handleAddStat = async () => {
    if (!newStat.label) return;
    try {
      await addStat(newStat).unwrap();
      setNewStat({ label: '', value: 0, suffix: '', icon: '' });
      addToast('Stat added!', 'success');
    } catch (err) {
      addToast('Failed to add stat.', 'error');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-8 w-full mx-auto"
    >
      {/* 1. ABOUT CONTENT SECTION */}
      <div className="bg-white/50 dark:bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">About Section Details</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Update your main introduction text.</p>
        </div>

        {contentLoading ? (
          <div className="text-slate-400 dark:text-zinc-500 animate-pulse">Loading content...</div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Title</label>
              <Input 
                value={contentForm.title} 
                onChange={(e) => setContentForm({...contentForm, title: e.target.value})} 
                className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800/50 text-white" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Subtitle</label>
              <Input 
                value={contentForm.subtitle} 
                onChange={(e) => setContentForm({...contentForm, subtitle: e.target.value})} 
                className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800/50 text-white" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Description</label>
              <Textarea 
                rows={4} 
                value={contentForm.description} 
                onChange={(e) => setContentForm({...contentForm, description: e.target.value})} 
                className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800/50 text-white" 
              />
            </div>
            <Button 
              onClick={handleSaveContent} 
              disabled={updatingContent}
              className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {updatingContent ? 'Saving...' : 'Save Content'}
            </Button>
          </div>
        )}
      </div>

      {/* 2. SKILLS SECTION */}
      <div className="bg-white/50 dark:bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">About Skills</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Manage the skills listed in your about section.</p>
        </div>

        {/* Add Skill Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 dark:bg-zinc-950/50 p-4 rounded-xl border border-slate-200 dark:border-white/5">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 dark:text-zinc-500">Title</label>
            <Input value={newSkill.title} onChange={e => setNewSkill({...newSkill, title: e.target.value})} className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-white h-9 text-sm" placeholder="e.g. Clean Code" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs text-slate-400 dark:text-zinc-500">Description</label>
            <Input value={newSkill.description} onChange={e => setNewSkill({...newSkill, description: e.target.value})} className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-white h-9 text-sm" placeholder="e.g. Writing maintainable software" />
          </div>
          <Button onClick={handleAddSkill} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-9">
            <Plus className="w-4 h-4 mr-1" /> Add Skill
          </Button>
        </div>

        {/* Skills List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skills?.map((skill) => (
            <div key={skill.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/5 group">
              <div>
                <h4 className="text-slate-900 dark:text-white font-medium text-sm">{skill.title}</h4>
                <p className="text-slate-400 dark:text-zinc-500 text-xs mt-1">{skill.description}</p>
              </div>
              <button 
                onClick={async () => {
                  try {
                    await deleteSkill(skill.id).unwrap();
                    addToast('Skill deleted.', 'success');
                  } catch (err) {
                    addToast('Failed to delete skill. Error: ' + (err?.data || err?.message || 'Unknown error'), 'error');
                  }
                }}
                className="p-2 text-slate-400 dark:text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. STATS SECTION */}
      <div className="bg-white/50 dark:bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Portfolio Stats</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Manage the numeric stats (e.g. Years Experience, Projects).</p>
        </div>

        {/* Add Stat Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 dark:bg-zinc-950/50 p-4 rounded-xl border border-slate-200 dark:border-white/5">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 dark:text-zinc-500">Label</label>
            <Input value={newStat.label} onChange={e => setNewStat({...newStat, label: e.target.value})} className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-white h-9 text-sm" placeholder="e.g. Projects" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 dark:text-zinc-500">Value (Number)</label>
            <Input type="number" value={newStat.value} onChange={e => setNewStat({...newStat, value: parseInt(e.target.value) || 0})} className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-white h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 dark:text-zinc-500">Suffix</label>
            <Input value={newStat.suffix} onChange={e => setNewStat({...newStat, suffix: e.target.value})} className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-white h-9 text-sm" placeholder="e.g. +" />
          </div>
          <Button onClick={handleAddStat} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-9">
            <Plus className="w-4 h-4 mr-1" /> Add Stat
          </Button>
        </div>

        {/* Stats List */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats?.map((stat) => (
            <div key={stat.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/5 group">
              <div>
                <p className="text-slate-400 dark:text-zinc-500 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}<span className="text-blue-400">{stat.suffix}</span></p>
              </div>
              <button 
                onClick={async () => {
                  try {
                    await deleteStat(stat.id).unwrap();
                    addToast('Stat deleted.', 'success');
                  } catch (err) {
                    addToast('Failed to delete stat. Error: ' + (err?.data || err?.message || 'Unknown error'), 'error');
                  }
                }}
                className="p-2 text-slate-400 dark:text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
