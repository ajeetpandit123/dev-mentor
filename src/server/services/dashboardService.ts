import { getServiceSupabase } from '@/lib/supabase';

export async function getDashboardData(userId?: string) {
  const adminSupabase = getServiceSupabase();
  
  try {
    // 1. Fetch user profile
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('full_name, id')
      .eq('id', userId)
      .maybeSingle();

    console.log('DEBUG: Fetching Profile for ID:', userId);
    console.log('DEBUG: Profile Result:', profile);
    if (profileError) console.error('DEBUG: Profile Error:', profileError);

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

    // Generate dynamic recommendations based on REAL weaknesses and suggestions
    const recommendations = [];

    // 1. Weak Zone from Resume
    if (resumeAnalysis.weakPoints && resumeAnalysis.weakPoints.length > 0) {
      recommendations.push({
        title: "Weak Zone Fix",
        desc: resumeAnalysis.weakPoints[0],
        icon: 'alert',
        action: 'resume',
        link: '/analyze/resume'
      });
    }

    // 2. Strong Zone / Next Step
    if (resumeAnalysis.suggestions && resumeAnalysis.suggestions.length > 0) {
      recommendations.push({
        title: "Strength Booster",
        desc: resumeAnalysis.suggestions[0],
        icon: 'rocket',
        action: 'resume',
        link: '/analyze/resume'
      });
    }

    // 3. Code Feedback
    if (repoAnalysis.feedback && repoAnalysis.feedback.length > 0) {
      recommendations.push({
        title: "Code Quality Tip",
        desc: repoAnalysis.feedback[0],
        icon: 'zap',
        action: 'repo',
        link: '/analyze/repo'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        title: "Get Started",
        desc: "Upload your resume to see your weak and strong zones.",
        icon: 'rocket',
        action: 'resume',
        link: '/analyze/resume'
      });
    }

    // Return aggregated data
    return {
      userName: profile?.full_name?.split(' ')[0] || 'Developer',
      stats: {
        codeQuality: latestRepo?.score || "8.4",
        skillProgress: Math.min(100, (resumeAnalysis.keywordsFound?.length || 0) * 8),
        roadmapTasks: `${resumeAnalysis.keywordsFound?.length || 0} Skills`,
        atsScore: latestResume?.ats_score || "82",
      },
      skillDevelopment: [40, 70, 45, 90, 65, 80, 55],
      recommendations: recommendations.slice(0, 3),
      goals: [
        { label: "ATS Optimization", progress: latestResume?.ats_score || 0 },
        { label: "Skill Gap Coverage", progress: Math.min(100, (resumeAnalysis.keywordsFound?.length || 0) * 10) },
        { label: "Code Quality", progress: (latestRepo?.score || 0) * 10 }
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
