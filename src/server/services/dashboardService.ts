import { supabase } from '@/lib/supabase';

export async function getDashboardData(userId?: string) {
  // If no user is logged in (development/demo), return mock data
  // In a real app, we would fetch from Supabase
  
  try {
    // 1. Fetch latest repo analysis
    const { data: latestRepo } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // 2. Fetch latest resume analysis
    const { data: latestResume } = await supabase
      .from('resumes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // 3. Fetch recent activities
    const { data: activities } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    // Return aggregated data
    return {
      stats: {
        codeQuality: latestRepo?.score || 8.4,
        skillProgress: 64, // This could be calculated from roadmap tasks
        roadmapTasks: "12/18",
        atsScore: latestResume?.ats_score || 82,
      },
      skillDevelopment: [40, 70, 45, 90, 65, 80, 55], // Weekly trend
      recentActivity: activities?.map(a => ({
        time: formatTime(a.created_at),
        title: a.title,
        desc: a.description
      })) || [
        { time: "2 hours ago", title: "Repo Analyzed", desc: "Portfolio-V2 reached 8.7/10" },
        { time: "Yesterday", title: "Resume Uploaded", desc: "ATS score improved to 82" },
        { time: "2 days ago", title: "New Roadmap", desc: "Fullstack Engineer path started" }
      ]
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return mock data as fallback
    return {
      stats: { codeQuality: 8.4, skillProgress: 64, roadmapTasks: "12/18", atsScore: 82 },
      skillDevelopment: [40, 70, 45, 90, 65, 80, 55],
      recentActivity: [
        { time: "2 hours ago", title: "Repo Analyzed", desc: "Portfolio-V2 reached 8.7/10" },
        { time: "Yesterday", title: "Resume Uploaded", desc: "ATS score improved to 82" },
        { time: "2 days ago", title: "New Roadmap", desc: "Fullstack Engineer path started" }
      ]
    };
  }
}

function formatTime(date: string) {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInHours < 48) return 'Yesterday';
  return `${Math.floor(diffInHours / 24)} days ago`;
}
