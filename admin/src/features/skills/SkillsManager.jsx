import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as FaIcons from 'react-icons/fa';
import * as SiIcons from 'react-icons/si';
import {
  Plus, Pencil, Trash2, GripVertical, Search, X,
  ChevronDown, ChevronUp, Save, RefreshCw, Layers,
  Sparkles, AlertCircle, CheckCircle2, Loader2, Code2,
} from 'lucide-react';
import axiosClient from '../../utils/axiosClient';
import DynamicIcon from '../../components/common/DynamicIcon';

// ─── Axios instance ─────────────────────────────────────────
const api = axiosClient;

// ─── Toast ──────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
    className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl max-w-sm
      ${type === 'success' ? 'bg-emerald-900/80 border-emerald-500/40 text-emerald-200' : 'bg-red-900/80 border-red-500/40 text-red-200'}`}
  >
    {type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
    <span className="text-sm font-medium">{message}</span>
    <button onClick={onClose}><X className="w-3.5 h-3.5" /></button>
  </motion.div>
);

// ─── Sortable skill row ──────────────────────────────────────
const SortableSkillRow = ({ skill, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: skill.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style}
      className="flex items-center gap-3 p-3 rounded-xl bg-[#FCFCFD] dark:bg-[#111217] border border-[#E2E8F0] dark:border-white/5 group hover:border-blue-500/40 hover:shadow-md transition-all duration-300 shadow-sm"
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-[#94A3B8] hover:text-[#64748B] dark:text-zinc-500 dark:hover:text-zinc-400 flex-shrink-0">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] dark:bg-zinc-950/50 flex items-center justify-center border border-[#E2E8F0] dark:border-white/5 shadow-inner flex-shrink-0">
        <DynamicIcon iconName={skill.iconName} iconLibrary={skill.iconLibrary} size={14} className={skill.iconColor || 'text-blue-500'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#0F172A] dark:text-zinc-100 truncate">{skill.skillName}</p>
        <p className="text-[10px] text-[#94A3B8] dark:text-zinc-500 truncate">{skill.iconLibrary}/{skill.iconName}</p>
      </div>
      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
        <div className="w-20 h-1.5 bg-[#E2E8F0] dark:bg-zinc-950 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${skill.proficiency}%` }} />
        </div>
        <span className="text-[10px] text-[#64748B] dark:text-zinc-450 w-8 text-right font-bold">{skill.proficiency}%</span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={() => onEdit(skill)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-[#64748B] dark:text-zinc-400 hover:text-blue-500 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
        <button onClick={() => onDelete(skill.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#64748B] dark:text-zinc-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
};

// ─── Category Section ────────────────────────────────────────
const CategorySection = ({ category, onEditCat, onDeleteCat, onAddSkill, onEditSkill, onDeleteSkill, reload }) => {
  const [open, setOpen] = useState(true);
  const [skills, setSkills] = useState(category.skills || []);
  useEffect(() => setSkills(category.skills || []), [category.skills]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = skills.findIndex(s => s.id === active.id);
    const to   = skills.findIndex(s => s.id === over.id);
    const next = arrayMove(skills, from, to);
    setSkills(next);
    try { await api.put('/skills/reorder', next.map((s, i) => ({ id: s.id, sortOrder: i }))); } catch {}
  }, [skills]);

  const colorMap = { blue:'border-blue-500/25', emerald:'border-emerald-500/25', purple:'border-purple-500/25', cyan:'border-cyan-500/25', rose:'border-rose-500/25', orange:'border-orange-500/25' };
  const border = colorMap[category.gradientFrom?.split('-')[0]] || 'border-zinc-700/40';

  return (
    <div className={`rounded-2xl border ${border} bg-white dark:bg-zinc-900/60 backdrop-blur-sm overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="p-2.5 rounded-xl bg-[#F1F5F9] dark:bg-zinc-950/50 border border-[#E2E8F0] dark:border-white/5 flex-shrink-0 shadow-inner">
          <DynamicIcon iconName={category.iconName} iconLibrary={category.iconLibrary} size={16} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white truncate text-sm">{category.title}</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 truncate">{category.description || 'No description'}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 border border-zinc-700 text-slate-500 dark:text-zinc-400 px-2 py-0.5 rounded-full">{skills.length} skills</span>
          <button onClick={() => onEditCat(category)} className="p-1.5 rounded-lg hover:bg-blue-500/20 text-slate-500 dark:text-zinc-400 hover:text-blue-400 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => onDeleteCat(category.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 dark:text-zinc-400 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg hover:bg-zinc-700/50 text-slate-500 dark:text-zinc-400 transition-colors">
            {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Skill list */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-2 border-t border-zinc-700/30 pt-3">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={skills.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  {skills.map(skill => (
                    <SortableSkillRow key={skill.id} skill={skill} onEdit={onEditSkill} onDelete={onDeleteSkill} />
                  ))}
                </SortableContext>
              </DndContext>
              {skills.length === 0 && <p className="text-center text-xs text-zinc-600 py-3">No skills yet.</p>}
              <motion.button
                onClick={() => onAddSkill(category.id)}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-2.5 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 text-[#64748B] dark:text-zinc-400 hover:text-[#0F172A] dark:hover:text-zinc-200 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-all text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Plus className="w-3.5 h-3.5" /> Add Skill to {category.title}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Modal wrapper ───────────────────────────────────────────
const Modal = ({ title, onClose, onSubmit, loading, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <motion.div initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 16 }}
      className="bg-white dark:bg-zinc-900 border border-zinc-700/60 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700/40">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-zinc-700/50 text-slate-500 dark:text-zinc-400 hover:text-zinc-200 transition-colors"><X className="w-4 h-4" /></button>
      </div>
      <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
        {children}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-700 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:bg-zinc-800 transition-colors text-sm font-medium">Cancel</button>
          <button type="submit" disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-slate-900 dark:text-white font-semibold text-sm hover:from-blue-500 hover:to-violet-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </motion.div>
  </div>
);

const inp = "w-full bg-slate-100 dark:bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors";
const Fld = ({ label, children }) => (
  <div>
    <label className="block text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function SkillsManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [toast, setToast]           = useState(null);
  const [catModal, setCatModal]     = useState(null);   // null | 'create' | catObj
  const [skillModal, setSkillModal] = useState(null);   // null | { categoryId } | skillObj
  const [saving, setSaving]         = useState(false);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); };

  // Category form
  const blankCat = { title: '', description: '', iconName: '', iconLibrary: 'react-icons/si', gradientFrom: 'blue', gradientTo: 'cyan', sortOrder: 0 };
  const [catForm, setCatForm] = useState(blankCat);

  // Skill form
  const blankSkill = { categoryId: '', skillName: '', iconName: '', iconLibrary: 'react-icons/si', iconColor: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', proficiency: 80, sortOrder: 0 };
  const [skillForm, setSkillForm] = useState(blankSkill);

  // Load data
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/skillcategories');
      setCategories(Array.isArray(data) ? data : data.$values ?? []);
    } catch (e) {
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filtered
  const filtered = categories.filter(c =>
    !search ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.skills || []).some(s => s.skillName.toLowerCase().includes(search.toLowerCase()))
  );

  // Stats
  const totalSkills = categories.reduce((a, c) => a + (c.skills?.length || 0), 0);
  const avgProf = (() => {
    const all = categories.flatMap(c => c.skills || []);
    return all.length ? Math.round(all.reduce((a, s) => a + s.proficiency, 0) / all.length) : 0;
  })();

  // ── Open modals ──
  const openCatCreate = () => { setCatForm({ ...blankCat, sortOrder: categories.length }); setCatModal('create'); };
  const openCatEdit = c => { setCatForm({ title: c.title, description: c.description || '', iconName: c.iconName || '', iconLibrary: c.iconLibrary || 'react-icons/si', gradientFrom: c.gradientFrom || 'blue', gradientTo: c.gradientTo || 'cyan', sortOrder: c.sortOrder }); setCatModal(c); };
  const openSkillCreate = catId => { setSkillForm({ ...blankSkill, categoryId: catId }); setSkillModal({ categoryId: catId }); };
  const openSkillEdit = s => { setSkillForm({ categoryId: s.categoryId, skillName: s.skillName, iconName: s.iconName || '', iconLibrary: s.iconLibrary || 'react-icons/si', iconColor: s.iconColor || 'text-blue-400', bgColor: s.bgColor || 'bg-blue-500/10', borderColor: s.borderColor || 'border-blue-500/30', proficiency: s.proficiency, sortOrder: s.sortOrder }); setSkillModal(s); };

  // ── CRUD: Category ──
  const submitCat = async e => {
    e.preventDefault();
    if (!catForm.title.trim()) return;
    setSaving(true);
    try {
      if (catModal === 'create') { await api.post('/skillcategories', catForm); showToast('Category created!'); }
      else { await api.put(`/skillcategories/${catModal.id}`, catForm); showToast('Category updated!'); }
      setCatModal(null); await load();
    } catch { showToast('Failed to save category', 'error'); }
    finally { setSaving(false); }
  };
  const deleteCat = async id => {
    if (!window.confirm('Delete this category and ALL its skills?')) return;
    try { await api.delete(`/skillcategories/${id}`); showToast('Category deleted.'); await load(); }
    catch { showToast('Failed to delete category', 'error'); }
  };

  // ── CRUD: Skill ──
  const submitSkill = async e => {
    e.preventDefault();
    if (!skillForm.skillName.trim()) return;
    setSaving(true);
    try {
      if (!skillModal?.id) { await api.post('/skills', skillForm); showToast('Skill added!'); }
      else { await api.put(`/skills/${skillModal.id}`, skillForm); showToast('Skill updated!'); }
      setSkillModal(null); await load();
    } catch { showToast('Failed to save skill', 'error'); }
    finally { setSaving(false); }
  };
  const deleteSkill = async id => {
    if (!window.confirm('Delete this skill?')) return;
    try { await api.delete(`/skills/${id}`); showToast('Skill deleted.'); await load(); }
    catch { showToast('Failed to delete skill', 'error'); }
  };

  const iconLibOpts = ['react-icons/fa', 'react-icons/si', 'react-icons/fa6', 'react-icons/tb', 'lucide-react'];

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Skills Manager</h1>
          <p className="text-slate-400 dark:text-zinc-500 text-sm mt-1">Manage skill categories and individual skills</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl hover:bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-zinc-200 transition-colors" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Categories',      value: categories.length, icon: Layers,   color: 'text-blue-400'   },
          { label: 'Total Skills',    value: totalSkills,        icon: Sparkles, color: 'text-emerald-400'},
          { label: 'Avg Proficiency', value: `${avgProf}%`,      icon: Code2,    color: 'text-purple-400' },
          { label: 'Icon Libraries',  value: [...new Set(categories.flatMap(c => c.skills || []).map(s => s.iconLibrary).filter(Boolean))].length, icon: Sparkles, color: 'text-orange-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/60 rounded-2xl p-4">
            <Icon className={`w-4 h-4 ${color} mb-2`} />
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search categories or skills..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-zinc-800/60 border border-zinc-700/40 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-zinc-300"><X className="w-3.5 h-3.5" /></button>}
        </div>
        <button
          onClick={openCatCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-slate-900 dark:text-white font-semibold text-sm hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-500/20 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* ── List ── */}
      {loading
        ? <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>
        : (
          <div className="space-y-4">
            {filtered.map(cat => (
              <CategorySection
                key={cat.id} category={cat}
                onEditCat={openCatEdit} onDeleteCat={deleteCat}
                onAddSkill={openSkillCreate} onEditSkill={openSkillEdit} onDeleteSkill={deleteSkill}
                reload={load}
              />
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <Layers className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-slate-400 dark:text-zinc-500 text-sm">No categories yet. Create one to get started.</p>
              </div>
            )}
          </div>
        )
      }

      {/* ── Category Modal ── */}
      <AnimatePresence>
        {catModal && (
          <Modal title={catModal === 'create' ? 'Add Category' : 'Edit Category'} onClose={() => setCatModal(null)} onSubmit={submitCat} loading={saving}>
            <Fld label="Title *">
              <input required value={catForm.title} onChange={e => setCatForm({ ...catForm, title: e.target.value })} placeholder="e.g. Frontend Development" className={inp} />
            </Fld>
            <Fld label="Description">
              <textarea value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} placeholder="Short description..." rows={2} className={`${inp} resize-none`} />
            </Fld>
            <div className="grid grid-cols-2 gap-3">
              <Fld label="Icon Name">
                <input value={catForm.iconName} onChange={e => setCatForm({ ...catForm, iconName: e.target.value })} placeholder="e.g. SiReact" className={inp} />
              </Fld>
              <Fld label="Icon Library">
                <select value={catForm.iconLibrary} onChange={e => setCatForm({ ...catForm, iconLibrary: e.target.value })} className={inp}>
                  {iconLibOpts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Fld>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Fld label="Gradient From"><input value={catForm.gradientFrom} onChange={e => setCatForm({ ...catForm, gradientFrom: e.target.value })} placeholder="blue" className={inp} /></Fld>
              <Fld label="Gradient To"><input value={catForm.gradientTo} onChange={e => setCatForm({ ...catForm, gradientTo: e.target.value })} placeholder="cyan" className={inp} /></Fld>
            </div>

            {catForm.iconName && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-zinc-800/40 border border-zinc-700/30">
                <span className="text-xs text-slate-400 dark:text-zinc-500">Preview:</span>
                <DynamicIcon iconName={catForm.iconName} iconLibrary={catForm.iconLibrary} size={18} className="text-blue-400" />
                <span className="text-sm text-zinc-300">{catForm.iconName}</span>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Skill Modal ── */}
      <AnimatePresence>
        {skillModal && (
          <Modal title={skillModal?.id ? 'Edit Skill' : 'Add Skill'} onClose={() => setSkillModal(null)} onSubmit={submitSkill} loading={saving}>
            <Fld label="Category">
              <select value={skillForm.categoryId} onChange={e => setSkillForm({ ...skillForm, categoryId: +e.target.value })} className={inp}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </Fld>
            <Fld label="Skill Name *">
              <input required value={skillForm.skillName} onChange={e => setSkillForm({ ...skillForm, skillName: e.target.value })} placeholder="e.g. React.js" className={inp} />
            </Fld>
            <div className="grid grid-cols-2 gap-3">
              <Fld label="Icon Name">
                <input value={skillForm.iconName} onChange={e => setSkillForm({ ...skillForm, iconName: e.target.value })} placeholder="e.g. SiReact" className={inp} />
              </Fld>
              <Fld label="Icon Library">
                <select value={skillForm.iconLibrary} onChange={e => setSkillForm({ ...skillForm, iconLibrary: e.target.value })} className={inp}>
                  {iconLibOpts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Fld>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Fld label="Icon Color"><input value={skillForm.iconColor} onChange={e => setSkillForm({ ...skillForm, iconColor: e.target.value })} placeholder="text-blue-400" className={inp} /></Fld>
              <Fld label="BG Color"><input value={skillForm.bgColor} onChange={e => setSkillForm({ ...skillForm, bgColor: e.target.value })} placeholder="bg-blue-500/10" className={inp} /></Fld>
              <Fld label="Border Color"><input value={skillForm.borderColor} onChange={e => setSkillForm({ ...skillForm, borderColor: e.target.value })} placeholder="border-blue-500/30" className={inp} /></Fld>
            </div>
            <Fld label={`Proficiency: ${skillForm.proficiency}%`}>
              <input type="range" min={0} max={100} step={5} value={skillForm.proficiency} onChange={e => setSkillForm({ ...skillForm, proficiency: +e.target.value })} className="w-full accent-blue-500" />
              <div className="mt-1.5 w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all" style={{ width: `${skillForm.proficiency}%` }} />
              </div>
            </Fld>

            {skillForm.iconName && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-zinc-800/40 border border-zinc-700/30">
                <span className="text-xs text-slate-400 dark:text-zinc-500">Preview:</span>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${skillForm.borderColor} ${skillForm.bgColor}`}>
                  <DynamicIcon iconName={skillForm.iconName} iconLibrary={skillForm.iconLibrary} size={13} className={skillForm.iconColor} />
                  <span className="text-xs text-zinc-200">{skillForm.skillName || 'Skill Name'}</span>
                </div>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
