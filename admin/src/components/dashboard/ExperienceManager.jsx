import React, { useState, useEffect, useMemo } from 'react';
import { 
  useGetExperiencesQuery, 
  useCreateExperienceMutation, 
  useUpdateExperienceMutation, 
  useDeleteExperienceMutation, 
  useReorderExperiencesMutation 
} from '../../store/apiSlice';
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay
} from '@dnd-kit/core';
import { 
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus, Pencil, Trash2, GripVertical, AlertCircle, Loader2, Save, X, Briefcase
} from 'lucide-react';
import DynamicIcon from './DynamicIcon';

// ============================================================================
// SORTABLE ITEM COMPONENT
// ============================================================================
const SortableItem = ({ id, experience, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-4 p-4 rounded-2xl border ${isDragging ? 'border-blue-500 bg-zinc-900/80 shadow-2xl' : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60'} transition-colors`}>
      <div {...attributes} {...listeners} className="p-2 cursor-grab active:cursor-grabbing text-zinc-500 hover:text-white rounded-lg">
        <GripVertical size={20} />
      </div>
      
      <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/50">
        <DynamicIcon iconName={experience.iconName} iconLibrary={experience.iconLibrary} size={24} className="text-white" style={experience.iconColor ? { color: experience.iconColor } : {}} />
      </div>

      <div className="flex-grow min-w-0">
        <h4 className="text-base font-bold text-white truncate">{experience.role}</h4>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span>{experience.company}</span>
          <span className="w-1 h-1 rounded-full bg-zinc-600" />
          <span>{experience.duration}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {experience.isCurrent && (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Current</span>
        )}
        <button onClick={() => onEdit(experience)} className="p-2 text-zinc-400 hover:text-blue-400 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
          <Pencil size={18} />
        </button>
        <button onClick={() => onDelete(experience.id)} className="p-2 text-zinc-400 hover:text-red-400 bg-zinc-800 hover:bg-red-500/20 rounded-lg transition-colors">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN MANAGER COMPONENT
// ============================================================================
export default function ExperienceManager() {
  const { data: expData, isLoading, error, refetch } = useGetExperiencesQuery();
  const [createExp] = useCreateExperienceMutation();
  const [updateExp] = useUpdateExperienceMutation();
  const [deleteExp] = useDeleteExperienceMutation();
  const [reorderExp] = useReorderExperiencesMutation();

  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Default form state
  const defaultForm = {
    role: '', company: '', location: '', duration: '', description: '', skills: [],
    iconName: 'Briefcase', iconLibrary: 'lucide-react', iconColor: '#3b82f6',
    gradientFrom: '#3b82f6', gradientTo: '#8b5cf6', isCurrent: false
  };
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [skillInput, setSkillInput] = useState('');

  const experiences = useMemo(() => Array.isArray(expData) ? expData : (expData?.$values || []), [expData]);

  useEffect(() => {
    if (experiences.length > 0) setItems(experiences.slice().sort((a, b) => a.sortOrder - b.sortOrder));
    else setItems([]);
  }, [experiences]);

  // Drag and Drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    const reorderedPayload = newItems.map((item, index) => ({ id: item.id, sortOrder: index }));
    try {
      await reorderExp(reorderedPayload).unwrap();
      refetch();
    } catch (err) {
      console.error('Failed to reorder', err);
      setItems(experiences); // revert
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateExp({ id: editingId, ...form }).unwrap();
      } else {
        await createExp({ ...form, sortOrder: items.length }).unwrap();
      }
      setIsModalOpen(false);
      setForm(defaultForm);
      setEditingId(null);
      refetch();
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save experience');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this experience?')) {
      try {
        await deleteExp(id).unwrap();
        refetch();
      } catch (err) {
        console.error('Delete failed', err);
      }
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm(prev => ({ ...prev, skills: [...(prev.skills || []), skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const Fld = ({ label, children }) => (
    <div><label className="block text-sm font-medium text-zinc-400 mb-1.5">{label}</label>{children}</div>
  );
  const inp = "w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="text-blue-500" /> Experience Timeline
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Manage your work history and roles.</p>
        </div>
        <button 
          onClick={() => { setForm(defaultForm); setEditingId(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} /> Add Role
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-blue-500"><Loader2 className="w-8 h-8 animate-spin" /></div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2"><AlertCircle size={20} /> Error loading data</div>
      ) : (
        <div className="space-y-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {items.map(exp => (
                <SortableItem key={exp.id} id={exp.id} experience={exp} onEdit={(e) => { setForm({ ...e, skills: e.skills || [] }); setEditingId(e.id); setIsModalOpen(true); }} onDelete={handleDelete} />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeId ? <SortableItem id={activeId} experience={items.find(i => i.id === activeId)} onEdit={() => {}} onDelete={() => {}} /> : null}
            </DragOverlay>
          </DndContext>
          {items.length === 0 && <div className="text-center py-10 text-zinc-500 border border-dashed border-zinc-700 rounded-2xl">No experiences found. Add one to get started!</div>}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl relative my-8">
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex justify-between items-center rounded-t-2xl z-10">
              <h3 className="text-xl font-bold text-white">{editingId ? 'Edit Experience' : 'Add Experience'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Fld label="Role *"><input required value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Senior Developer" className={inp} /></Fld>
                <Fld label="Company *"><input required value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Tech Corp" className={inp} /></Fld>
                <Fld label="Location"><input value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Remote" className={inp} /></Fld>
                <Fld label="Duration"><input value={form.duration || ''} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="2020 - 2023" className={inp} /></Fld>
              </div>

              <Fld label="Description">
                <textarea rows={4} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className={inp} placeholder="What did you do?" />
              </Fld>

              {/* Skills */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-400">Skills Used</label>
                <div className="flex gap-2">
                  <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Add a skill and press Enter" className={inp} />
                  <button type="button" onClick={addSkill} className="px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl">Add</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(form.skills || []).map((skill, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm">
                      {skill} <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-400 ml-1"><X size={14} /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Icons & Colors */}
              <div className="p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Fld label="Icon Name"><input value={form.iconName || ''} onChange={e => setForm({ ...form, iconName: e.target.value })} placeholder="Code" className={inp} /></Fld>
                  <Fld label="Library">
                    <select value={form.iconLibrary || ''} onChange={e => setForm({ ...form, iconLibrary: e.target.value })} className={inp}>
                      <option value="lucide-react">Lucide</option><option value="fa">FontAwesome</option><option value="si">SimpleIcons</option>
                    </select>
                  </Fld>
                  <Fld label="Color"><input type="color" value={form.iconColor || '#3b82f6'} onChange={e => setForm({ ...form, iconColor: e.target.value })} className="w-full h-11 p-1 rounded-lg bg-zinc-900 border border-zinc-700 cursor-pointer" /></Fld>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Fld label="Gradient From (Hex)"><input value={form.gradientFrom || ''} onChange={e => setForm({ ...form, gradientFrom: e.target.value })} placeholder="#3b82f6" className={inp} /></Fld>
                  <Fld label="Gradient To (Hex)"><input value={form.gradientTo || ''} onChange={e => setForm({ ...form, gradientTo: e.target.value })} placeholder="#8b5cf6" className={inp} /></Fld>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border border-zinc-800 rounded-xl bg-zinc-900/50 cursor-pointer" onClick={() => setForm(f => ({ ...f, isCurrent: !f.isCurrent }))}>
                <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${form.isCurrent ? 'bg-blue-500 border-blue-500 text-white' : 'border-zinc-600'}`}>
                  {form.isCurrent && <span className="text-sm">✓</span>}
                </div>
                <div><div className="text-white font-medium">Current Role</div><div className="text-xs text-zinc-500">Highlight this as your present job</div></div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-zinc-300 hover:bg-zinc-800 font-medium transition-colors">Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"><Save size={18} /> Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
