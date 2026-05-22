import React, { createContext, useContext, useState, useEffect } from 'react';
import { projectsData } from '../data/projects';
import { experiencesData } from '../data/experiences';
import { skillsData } from '../data/skills';
import { heroData } from '../data/hero';
import { aboutData } from '../data/about';
import { contactData } from '../data/contact';

const PortfolioDataContext = createContext();

export function PortfolioDataProvider({ children }) {
  // Existing state
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('portfolio_projects');
    return saved ? JSON.parse(saved) : projectsData;
  });

  const [experiences, setExperiences] = useState(() => {
    const saved = localStorage.getItem('portfolio_experiences');
    return saved ? JSON.parse(saved) : experiencesData;
  });

  const [skills, setSkills] = useState(() => {
    const saved = localStorage.getItem('portfolio_skills');
    return saved ? JSON.parse(saved) : skillsData;
  });

  // New state
  const [hero, setHero] = useState(() => {
    const saved = localStorage.getItem('portfolio_hero');
    return saved ? JSON.parse(saved) : heroData;
  });

  const [about, setAbout] = useState(() => {
    const saved = localStorage.getItem('portfolio_about');
    return saved ? JSON.parse(saved) : aboutData;
  });

  const [contact, setContact] = useState(() => {
    const saved = localStorage.getItem('portfolio_contact');
    return saved ? JSON.parse(saved) : contactData;
  });

  // Sync to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('portfolio_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('portfolio_experiences', JSON.stringify(experiences));
  }, [experiences]);

  useEffect(() => {
    localStorage.setItem('portfolio_skills', JSON.stringify(skills));
  }, [skills]);

  useEffect(() => {
    localStorage.setItem('portfolio_hero', JSON.stringify(hero));
  }, [hero]);

  useEffect(() => {
    localStorage.setItem('portfolio_about', JSON.stringify(about));
  }, [about]);

  useEffect(() => {
    localStorage.setItem('portfolio_contact', JSON.stringify(contact));
  }, [contact]);

  // Reset to static mock defaults
  const resetAll = () => {
    setProjects(projectsData);
    setExperiences(experiencesData);
    setSkills(skillsData);
    setHero(heroData);
    setAbout(aboutData);
    setContact(contactData);
  };

  // --- Projects CRUD ---
  const addProject = (project) => {
    const nextId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
    setProjects([...projects, { ...project, id: nextId }]);
  };

  const updateProject = (updated) => {
    setProjects(projects.map(p => p.id === updated.id ? updated : p));
  };

  const deleteProject = (id) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  // --- Experiences CRUD ---
  const addExperience = (exp) => {
    const nextId = experiences.length > 0 ? Math.max(...experiences.map(e => e.id)) + 1 : 1;
    setExperiences([...experiences, { ...exp, id: nextId }]);
  };

  const updateExperience = (updated) => {
    setExperiences(experiences.map(e => e.id === updated.id ? updated : e));
  };

  const deleteExperience = (id) => {
    setExperiences(experiences.filter(e => e.id !== id));
  };

  const reorderExperiences = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === experiences.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...experiences];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    setExperiences(reordered);
  };

  // --- Skills CRUD ---
  const addSkill = (categoryTitle, skill) => {
    setSkills(skills.map(cat => {
      if (cat.title === categoryTitle) {
        return {
          ...cat,
          skills: [...cat.skills, skill]
        };
      }
      return cat;
    }));
  };

  const updateSkill = (categoryTitle, skillName, updatedSkill) => {
    setSkills(skills.map(cat => {
      if (cat.title === categoryTitle) {
        return {
          ...cat,
          skills: cat.skills.map(s => s.name === skillName ? updatedSkill : s)
        };
      }
      return cat;
    }));
  };

  const deleteSkill = (categoryTitle, skillName) => {
    setSkills(skills.map(cat => {
      if (cat.title === categoryTitle) {
        return {
          ...cat,
          skills: cat.skills.filter(s => s.name !== skillName)
        };
      }
      return cat;
    }));
  };

  const addSkillCategory = (category) => {
    setSkills([...skills, { ...category, skills: [] }]);
  };

  const updateSkillCategory = (oldTitle, updatedCat) => {
    setSkills(skills.map(cat => cat.title === oldTitle ? { ...cat, ...updatedCat } : cat));
  };

  const deleteSkillCategory = (title) => {
    setSkills(skills.filter(cat => cat.title !== title));
  };

  return (
    <PortfolioDataContext.Provider value={{
      projects, addProject, updateProject, deleteProject,
      experiences, addExperience, updateExperience, deleteExperience, reorderExperiences,
      skills, addSkill, updateSkill, deleteSkill, addSkillCategory, updateSkillCategory, deleteSkillCategory,
      hero, setHero,
      about, setAbout,
      contact, setContact,
      resetAll
    }}>
      {children}
    </PortfolioDataContext.Provider>
  );
}

export function usePortfolioData() {
  const context = useContext(PortfolioDataContext);
  if (!context) {
    throw new Error('usePortfolioData must be used within a PortfolioDataProvider');
  }
  return context;
}
