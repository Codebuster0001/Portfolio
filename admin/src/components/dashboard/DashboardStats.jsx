import React, { useMemo } from 'react';
import { Layers, Users, MessageCircle, Code2 } from 'lucide-react';
import StatCard from './StatCard';
import { 
  useGetProjectsQuery, 
  useGetContactsQuery, 
  useGetAboutSkillsQuery 
} from '../../store/apiSlice';
import { supabase } from '../../lib/supabase';

export default function DashboardStats() {
  const { data: projectsData, isLoading: loadingProjects } = useGetProjectsQuery();
  const { data: contactsData, isLoading: loadingContacts } = useGetContactsQuery({ page: 1, pageSize: 1000 });
  const { data: skillsData, isLoading: loadingSkills } = useGetAboutSkillsQuery();

  const projects = Array.isArray(projectsData) ? projectsData : projectsData?.$values || [];
  const messages = contactsData?.items || [];
  const skills = Array.isArray(skillsData) ? skillsData : skillsData?.$values || [];

  const unreadMessages = React.useMemo(() => messages.filter(m => !m.isRead).length, [messages]);

  const [totalVisitors, setTotalVisitors] = React.useState(0);
  const [loadingVisitors, setLoadingVisitors] = React.useState(true);

  React.useEffect(() => {
    async function fetchVisitorsCount() {
      try {
        const { count, error } = await supabase
          .from('visitors')
          .select('*', { count: 'exact', head: true });
        
        if (!error && count !== null) {
          setTotalVisitors(count);
        }
      } catch (err) {
        console.error("Failed to fetch visitors:", err);
      } finally {
        setLoadingVisitors(false);
      }
    }
    fetchVisitorsCount();
  }, []);

  const visitorsTrend = "Real-time tracker";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Total Projects"  
        count={loadingProjects ? "..." : projects.length}    
        icon={Layers}        
        subtext="Live on portfolio"    
        color="blue"    
        index={0} 
      />
      <StatCard 
        title="Total Visitors"  
        count={loadingVisitors ? "..." : totalVisitors.toLocaleString()} 
        icon={Users}         
        subtext={visitorsTrend}  
        color="purple"  
        index={1} 
      />
      <StatCard 
        title="Total Messages"  
        count={loadingContacts ? "..." : messages.length}    
        icon={MessageCircle} 
        subtext={`${unreadMessages} unread`}         
        color="pink"    
        index={2} 
      />
      <StatCard 
        title="Total Skills"    
        count={loadingSkills ? "..." : skills.length}    
        icon={Code2}         
        subtext="Showcased skills"    
        color="emerald" 
        index={3} 
      />
    </div>
  );
}
