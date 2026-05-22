import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, Pencil, Trash2, GripVertical, Search, X, ChevronDown,
  ChevronUp, Save, RefreshCw, Shield, LogOut, Layers, Sparkles,
  AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSkill,
  updateSkill,
  deleteSkill,
  reorderCategoriesLocally,
  reorderSkillsLocally,
} from '../store/skillsSlice';
import { skillCategoriesApi, skillsApi } from '../services/skillsApi';
import DynamicIcon from '../components/skills/DynamicIcon';

// ============================================================
// Toast notification helper
// ============================================================
const Toast = ({ message, type = 'success', onClose }) => (
  <motion.div
    initial={{ opacity: 0, x: 40 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 40 }}
    className={`
      fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5
      rounded-2xl border backdrop-blur-xl shadow-2xl max-w-sm
      ${type === 'success'
        ? 'bg-emerald-900/80 border-emerald-500/40 text-emerald-200'
        : 'bg-red-900/80 border-red-500/40 text-red-200'}
    `}
  >
    {type === 'success'
      ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
      : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
    <span className="text-sm font-medium">{message}</span>
    <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
      <X className="w-3.5 h-3.5" />
    </button>
  </motion.div>
);

// ============================================================
// Sortable skill row (drag-and-drop)
// ============================================================
const SortableSkillRow = ({ skill, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: skill.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/40 group hover:border-zinc-600/60 transition-colors"
    >
      {/* Drag handle */}
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 transition-colors flex-shrink-0">
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Icon preview */}
      <div className="w-8 h-8 rounded-lg bg-zinc-700/50 flex items-center justify-center flex-shrink-0">
        <DynamicIcon iconName={skill.iconName} iconLibrary={skill.iconLibrary} size={14} className={skill.iconColor || 'text-blue-400'} />
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200 truncate">{skill.skillName}</p>
        <p className="text-[10px] text-zinc-500 truncate">{skill.iconLibrary}/{skill.iconName}</p>
      </div>

      {/* Proficiency */}
      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
        <div className="w-20 h-1 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            style={{ width: `${skill.proficiency}%` }}
          />
        </div>
        <span className="text-[10px] text-zinc-500 w-8 text-right">{skill.proficiency}%</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => onEdit(skill)}
          className="p-1.5 rounded-lg hover:bg-blue-500/20 text-zinc-400 hover:text-blue-400 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(skill.id)}
          className="p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ============================================================
// Category section (collapsible)
// ============================================================
const CategorySection = ({ category, onEditCategory, onDeleteCategory, onAddSkill, onEditSkill, onDeleteSkill, dispatch }) => {
  const [expanded, setExpanded] = useState(true);
  const [skills, setSkills] = useState(category.skills || []);

  useEffect(() => {
    setSkills(category.skills || []);
  }, [category.skills]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = skills.findIndex((s) => s.id === active.id);
    const newIndex = skills.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(skills, oldIndex, newIndex);

    setSkills(reordered);
    dispatch(reorderSkillsLocally({ categoryId: category.id, skills: reordered }));

    const items = reordered.map((s, i) => ({ id: s.id, sortOrder: i }));
    try { await skillsApi.reorder(items); } catch {}
  }, [skills, category.id, dispatch]);

  const glowMap = {
    blue: 'border-blue-500/30 shadow-blue-500/10',
    emerald: 'border-emerald-500/30 shadow-emerald-500/10',
    purple: 'border-purple-500/30 shadow-purple-500/10',
    cyan: 'border-cyan-500/30 shadow-cyan-500/10',
    rose: 'border-rose-500/30 shadow-rose-500/10',
    orange: 'border-orange-500/30 shadow-orange-500/10',
  };
  const borderClass = glowMap[category.gradientFrom?.split('-')[0]] || 'border-zinc-700/40';

  return (
    <div className={`rounded-2xl border ${borderClass} bg-zinc-900/60 backdrop-blur-sm overflow-hidden`}>
      {/* Category header */}
      <div className="flex items-center gap-3 p-4">
        <div className="p-2 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex-shrink-0">
          <DynamicIcon iconName={category.iconName} iconLibrary={category.iconLibrary} size={16} className="text-zinc-300" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{category.title}</h3>
          <p className="text-xs text-zinc-500 truncate">{category.description || 'No description'}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full">
            {skills.length} skills
          </span>
          <button onClick={() => onEditCategory(category)} className="p-1.5 rounded-lg hover:bg-blue-500/20 text-zinc-400 hover:text-blue-400 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDeleteCategory(category.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-200 transition-colors">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Skills list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 border-t border-zinc-700/30 pt-3">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={skills.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  {skills.map((skill) => (
                    <SortableSkillRow
                      key={skill.id}
                      skill={skill}
                      onEdit={onEditSkill}
                      onDelete={(id) => onDeleteSkill(id, category.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {skills.length === 0 && (
                <p className="text-center text-xs text-zinc-600 py-4">No skills yet. Add one below.</p>
              )}

              <button
                onClick={() => onAddSkill(category.id)}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-zinc-700/50 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Skill to {category.title}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================
// Modal — shared for category and skill forms
// ============================================================
const Modal = ({ title, onClose, onSubmit, loading, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="bg-zinc-900 border border-zinc-700/60 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
    >
      {/* Modal header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700/40">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-200 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Modal body */}
      <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        {children}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold text-sm hover:from-blue-500 hover:to-violet-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </motion.div>
  </div>
);

// Field component
const Field = ({ label, id, required, children }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors";

// ============================================================
// ADMIN SKILLS PAGE
// ============================================================
const AdminSkills = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, categoriesLoading, error } = useSelector((s) => s.skills);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Search
  const [search, setSearch] = useState('');

  // Modals
  const [catModal, setCatModal] = useState(null);      // null | 'create' | category obj
  const [skillModal, setSkillModal] = useState(null);  // null | { categoryId } | skill obj
  const [modalLoading, setModalLoading] = useState(false);

  // Category form state
  const [catForm, setCatForm] = useState({
    title: '', description: '', iconName: '', iconLibrary: 'react-icons/si',
    gradientFrom: 'blue', gradientTo: 'cyan', sortOrder: 0,
  });

  // Skill form state
  const [skillForm, setSkillForm] = useState({
    categoryId: '', skillName: '', iconName: '', iconLibrary: 'react-icons/si',
    iconColor: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
    proficiency: 80, sortOrder: 0,
  });

  // Auth check
  const token = localStorage.getItem('admin_token');
  useEffect(() => {
    if (!token) navigate('/');
  }, [token, navigate]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Filtered categories
  const filteredCategories = categories.filter((c) =>
    !search ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.skills?.some((s) => s.skillName.toLowerCase().includes(search.toLowerCase()))
  );

  // ── Open category modal ──
  const openCatCreate = () => {
    setCatForm({ title: '', description: '', iconName: '', iconLibrary: 'react-icons/si', gradientFrom: 'blue', gradientTo: 'cyan', sortOrder: categories.length });
    setCatModal('create');
  };
  const openCatEdit = (cat) => {
    setCatForm({ title: cat.title, description: cat.description || '', iconName: cat.iconName || '', iconLibrary: cat.iconLibrary || 'react-icons/si', gradientFrom: cat.gradientFrom || 'blue', gradientTo: cat.gradientTo || 'cyan', sortOrder: cat.sortOrder });
    setCatModal(cat);
  };

  // ── Open skill modal ──
  const openSkillCreate = (categoryId) => {
    setSkillForm({ categoryId, skillName: '', iconName: '', iconLibrary: 'react-icons/si', iconColor: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', proficiency: 80, sortOrder: 0 });
    setSkillModal({ categoryId });
  };
  const openSkillEdit = (skill) => {
    setSkillForm({ categoryId: skill.categoryId, skillName: skill.skillName, iconName: skill.iconName || '', iconLibrary: skill.iconLibrary || 'react-icons/si', iconColor: skill.iconColor || 'text-blue-400', bgColor: skill.bgColor || 'bg-blue-500/10', borderColor: skill.borderColor || 'border-blue-500/30', proficiency: skill.proficiency, sortOrder: skill.sortOrder });
    setSkillModal(skill);
  };

  // ── Submit category ──
  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (!catForm.title.trim()) return;
    setModalLoading(true);
    try {
      if (catModal === 'create') {
        await dispatch(createCategory(catForm)).unwrap();
        showToast('Category created successfully!');
      } else {
        await dispatch(updateCategory({ id: catModal.id, data: catForm })).unwrap();
        showToast('Category updated successfully!');
      }
      dispatch(fetchCategories());
      setCatModal(null);
    } catch (err) {
      showToast(err || 'Failed to save category', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // ── Delete category ──
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category and ALL its skills? This cannot be undone.')) return;
    try {
      await dispatch(deleteCategory(id)).unwrap();
      showToast('Category deleted.');
    } catch (err) {
      showToast(err || 'Failed to delete category', 'error');
    }
  };

  // ── Submit skill ──
  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    if (!skillForm.skillName.trim()) return;
    setModalLoading(true);
    try {
      if (!skillModal?.id) {
        await dispatch(createSkill(skillForm)).unwrap();
        showToast('Skill added!');
      } else {
        await dispatch(updateSkill({ id: skillModal.id, data: skillForm })).unwrap();
        showToast('Skill updated!');
      }
      dispatch(fetchCategories());
      setSkillModal(null);
    } catch (err) {
      showToast(err || 'Failed to save skill', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // ── Delete skill ──
  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await dispatch(deleteSkill(id)).unwrap();
      dispatch(fetchCategories());
      showToast('Skill deleted.');
    } catch (err) {
      showToast(err || 'Failed to delete skill', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* ── Admin Topbar ── */}
      <div className="sticky top-0 z-40 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800/60">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-bold text-white text-sm">Skills Admin</span>
            <span className="text-[10px] bg-zinc-800 border border-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded-full ml-1">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(fetchCategories())}
              className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => { localStorage.removeItem('admin_token'); navigate('/'); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Categories', value: categories.length, color: 'text-blue-400', icon: Layers },
            { label: 'Total Skills', value: categories.reduce((a, c) => a + (c.skills?.length || 0), 0), color: 'text-emerald-400', icon: Sparkles },
            { label: 'Avg Proficiency', value: (() => { const all = categories.flatMap(c => c.skills || []); return all.length ? Math.round(all.reduce((a, s) => a + s.proficiency, 0) / all.length) : 0; })() + '%', color: 'text-purple-400', icon: Shield },
            { label: 'Icon Libraries', value: [...new Set(categories.flatMap(c => c.skills || []).map(s => s.iconLibrary).filter(Boolean))].length, color: 'text-orange-400', icon: Sparkles },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4">
              <Icon className={`w-4 h-4 ${color} mb-2`} />
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              id="admin-search-skills"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories or skills..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/60 border border-zinc-700/40 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            id="add-category-btn"
            onClick={openCatCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold text-sm hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── Loading ── */}
        {categoriesLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        )}

        {/* ── Category sections ── */}
        {!categoriesLoading && (
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                onEditCategory={openCatEdit}
                onDeleteCategory={handleDeleteCategory}
                onAddSkill={openSkillCreate}
                onEditSkill={openSkillEdit}
                onDeleteSkill={handleDeleteSkill}
                dispatch={dispatch}
              />
            ))}
            {filteredCategories.length === 0 && !categoriesLoading && (
              <div className="text-center py-16">
                <Layers className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No categories found. Create one to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Category Modal ── */}
      <AnimatePresence>
        {catModal && (
          <Modal
            title={catModal === 'create' ? 'Add Skill Category' : 'Edit Category'}
            onClose={() => setCatModal(null)}
            onSubmit={handleCatSubmit}
            loading={modalLoading}
          >
            <Field label="Category Title" id="cat-title" required>
              <input id="cat-title" required value={catForm.title} onChange={(e) => setCatForm({ ...catForm, title: e.target.value })} placeholder="e.g. Frontend Development" className={inputCls} />
            </Field>
            <Field label="Description" id="cat-desc">
              <textarea id="cat-desc" value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} placeholder="Short description..." rows={2} className={`${inputCls} resize-none`} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Icon Name" id="cat-icon">
                <input id="cat-icon" value={catForm.iconName} onChange={(e) => setCatForm({ ...catForm, iconName: e.target.value })} placeholder="e.g. FaReact" className={inputCls} />
              </Field>
              <Field label="Icon Library" id="cat-icon-lib">
                <select id="cat-icon-lib" value={catForm.iconLibrary} onChange={(e) => setCatForm({ ...catForm, iconLibrary: e.target.value })} className={inputCls}>
                  <option value="react-icons/fa">react-icons/fa</option>
                  <option value="react-icons/si">react-icons/si</option>
                  <option value="react-icons/fa6">react-icons/fa6</option>
                  <option value="react-icons/tb">react-icons/tb</option>
                  <option value="lucide-react">lucide-react</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Gradient From" id="cat-grad-from">
                <input id="cat-grad-from" value={catForm.gradientFrom} onChange={(e) => setCatForm({ ...catForm, gradientFrom: e.target.value })} placeholder="e.g. blue-500" className={inputCls} />
              </Field>
              <Field label="Gradient To" id="cat-grad-to">
                <input id="cat-grad-to" value={catForm.gradientTo} onChange={(e) => setCatForm({ ...catForm, gradientTo: e.target.value })} placeholder="e.g. cyan-500" className={inputCls} />
              </Field>
            </div>
            <Field label="Sort Order" id="cat-sort">
              <input id="cat-sort" type="number" min={0} value={catForm.sortOrder} onChange={(e) => setCatForm({ ...catForm, sortOrder: +e.target.value })} className={inputCls} />
            </Field>
            {/* Live icon preview */}
            {catForm.iconName && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/30">
                <span className="text-xs text-zinc-500">Preview:</span>
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
          <Modal
            title={skillModal?.id ? 'Edit Skill' : 'Add Skill'}
            onClose={() => setSkillModal(null)}
            onSubmit={handleSkillSubmit}
            loading={modalLoading}
          >
            <Field label="Category" id="skill-cat">
              <select id="skill-cat" value={skillForm.categoryId} onChange={(e) => setSkillForm({ ...skillForm, categoryId: +e.target.value })} className={inputCls}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </Field>
            <Field label="Skill Name" id="skill-name" required>
              <input id="skill-name" required value={skillForm.skillName} onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })} placeholder="e.g. React.js" className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Icon Name" id="skill-icon">
                <input id="skill-icon" value={skillForm.iconName} onChange={(e) => setSkillForm({ ...skillForm, iconName: e.target.value })} placeholder="e.g. SiReact" className={inputCls} />
              </Field>
              <Field label="Icon Library" id="skill-icon-lib">
                <select id="skill-icon-lib" value={skillForm.iconLibrary} onChange={(e) => setSkillForm({ ...skillForm, iconLibrary: e.target.value })} className={inputCls}>
                  <option value="react-icons/fa">react-icons/fa</option>
                  <option value="react-icons/si">react-icons/si</option>
                  <option value="react-icons/fa6">react-icons/fa6</option>
                  <option value="react-icons/tb">react-icons/tb</option>
                  <option value="lucide-react">lucide-react</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Icon Color" id="skill-icon-color">
                <input id="skill-icon-color" value={skillForm.iconColor} onChange={(e) => setSkillForm({ ...skillForm, iconColor: e.target.value })} placeholder="text-blue-400" className={inputCls} />
              </Field>
              <Field label="BG Color" id="skill-bg-color">
                <input id="skill-bg-color" value={skillForm.bgColor} onChange={(e) => setSkillForm({ ...skillForm, bgColor: e.target.value })} placeholder="bg-blue-500/10" className={inputCls} />
              </Field>
              <Field label="Border Color" id="skill-border-color">
                <input id="skill-border-color" value={skillForm.borderColor} onChange={(e) => setSkillForm({ ...skillForm, borderColor: e.target.value })} placeholder="border-blue-500/30" className={inputCls} />
              </Field>
            </div>
            <Field label={`Proficiency: ${skillForm.proficiency}%`} id="skill-prof">
              <input
                id="skill-prof"
                type="range" min={0} max={100} step={5}
                value={skillForm.proficiency}
                onChange={(e) => setSkillForm({ ...skillForm, proficiency: +e.target.value })}
                className="w-full accent-blue-500"
              />
              <div className="mt-1 w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all" style={{ width: `${skillForm.proficiency}%` }} />
              </div>
            </Field>
            <Field label="Sort Order" id="skill-sort">
              <input id="skill-sort" type="number" min={0} value={skillForm.sortOrder} onChange={(e) => setSkillForm({ ...skillForm, sortOrder: +e.target.value })} className={inputCls} />
            </Field>
            {/* Live icon preview */}
            {skillForm.iconName && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/30">
                <span className="text-xs text-zinc-500">Preview:</span>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${skillForm.borderColor} ${skillForm.bgColor}`}>
                  <DynamicIcon iconName={skillForm.iconName} iconLibrary={skillForm.iconLibrary} size={14} className={skillForm.iconColor} />
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
};

export default AdminSkills;
