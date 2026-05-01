import { octokit } from '@/lib/octokit';
import { callSmartAI } from './aiService';
import { getServiceSupabase } from '@/lib/supabase';

/**
 * Repository Analysis Service
 * 
 * Fetches code from GitHub and performs a deep architectural review using Gemini 2.5 Flash.
 */
export async function analyzeRepository(repoUrl: string, userId?: string) {
  try {
    const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)/;
    const match = repoUrl.match(githubRegex);
    if (!match) throw new Error('Invalid GitHub URL format.');
    const owner = match[1];
    const repo = match[2].replace(/\.git$/, '');

    // 1. Fetch code content
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    const { data: treeData } = await octokit.rest.git.getTree({
      owner, repo, tree_sha: repoData.default_branch, recursive: 'true',
    });
    const codeFiles = treeData.tree.filter(f => f.path?.match(/\.(ts|tsx|js|jsx|py)$/) && !f.path?.includes('node_modules')).slice(0, 5);
    const contents = await Promise.all(codeFiles.map(async f => {
      const { data } = await octokit.rest.repos.getContent({ owner, repo, path: f.path || '' });
      return 'content' in data ? Buffer.from(data.content as string, 'base64').toString() : '';
    }));
    const combinedCode = contents.join('\n');

    const prompt = `Analyze this codebase: ${combinedCode.substring(0, 5000)}. Return JSON: { "score": number, "bestPractices": number, "security": string, "feedback": string[], "topLanguages": string[] }`;

    const result = await callSmartAI(
      [{ role: "user", content: prompt }],
      "You are an elite AI Code Architect.",
      { 
        response_format: { type: "json_object" }
      }
    );

    if (userId) {
      try {
        const adminSupabase = getServiceSupabase();
        await adminSupabase.from('projects').insert({
          user_id: userId, repo_url: repoUrl, repo_name: repo, score: result.score, analysis_result: result
        });
      } catch (dbError) { console.warn('DB Save Error:', dbError); }
    }

    return result;
  } catch (error: any) {
    console.error('Code Service Error:', error);
    throw error;
  }
}
