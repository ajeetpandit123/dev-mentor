import { getServiceSupabase } from '@/lib/supabase';

export async function getDashboardData(userId?: string) {
  const adminSupabase = getServiceSupabase();
  
  try {
    // 1. Fetch user profile
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('full_name, id')
      .eq('id', userId)
      .maybeSingle();

    console.log('DEBUG: Dashboard Profile:', profile);

    // 2. Fetch latest repo analysis
    const { data: latestRepo } = await adminSupabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 3. Fetch latest resume analysis
    const { data: latestResume } = await adminSupabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 4. Fetch recent activities
    const { data: activities } = await adminSupabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Parse analysis results
    const resumeAnalysis = latestResume?.analysis_result || {};
    const repoAnalysis = latestRepo?.analysis_result || {};

    // Generate dynamic recommendations
    const recommendations = [
      ...(resumeAnalysis.suggestions?.slice(0, 1).map((s: string) => ({
        title: "Resume Improvement",
        desc: s,
        icon: 'rocket'
      })) || []),
      ...(repoAnalysis.feedback?.slice(0, 1).map((f: string) => ({
        title: "Code Optimization",
        desc: f,
        icon: 'zap'
      })) || [])
    ];

    if (recommendations.length === 0) {
      recommendations.push({
        title: "Get Started",
        desc: "Upload your resume or link a repo to see custom tips.",
        icon: 'rocket'
      });
    }

    // Return aggregated data
    return {
      userName: profile?.full_name?.split(' ')[0] || 'Developer',
      stats: {
        codeQuality: latestRepo?.score || "8.4",
        skillProgress: 64,
        roadmapTasks: "12/18",
        atsScore: latestResume?.ats_score || "82",
      },
      skillDevelopment: [40, 70, 45, 90, 65, 80, 55],
      recommendations,
      goals: [
        { label: "Improve ATS Score", progress: latestResume?.ats_score || 0 },
        { label: "Code Quality Goal", progress: (latestRepo?.score || 0) * 10 }
      ],
      recentActivity: activities?.map(a => ({
        time: formatTime(a.created_at),
        title: a.title,
        desc: a.description
      })) || []
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
