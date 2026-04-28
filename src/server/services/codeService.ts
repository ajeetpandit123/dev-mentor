import { octokit } from '@/lib/octokit';
import { callAnthropic } from '@/lib/anthropic';
import { supabase } from '@/lib/supabase';

export async function analyzeRepository(repoUrl: string) {
  try {
    // Robust regex to extract owner and repo from various GitHub URL formats
    const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)/;
    const match = repoUrl.match(githubRegex);
    
    if (!match) {
      throw new Error('Invalid GitHub URL format. Please use https://github.com/owner/repo');
    }

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, ''); // Remove .git suffix if present


    // 1. Get Repo Data
    console.log('Fetching repo data for:', owner, repo);
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    const defaultBranch = repoData.default_branch;

    // 2. Get File Tree
    console.log('Fetching file tree...');
    const { data: treeData } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: defaultBranch,
      recursive: 'true',
    });

    // 3. Filter for code files (Top 10 relevant files)
    const codeFiles = treeData.tree
      .filter(file => 
        file.path?.match(/\.(ts|tsx|js|jsx|py|go|rs|java|c|cpp)$/) && 
        !file.path?.includes('node_modules') &&
        !file.path?.includes('dist')
      )
      .slice(0, 10);

    if (codeFiles.length === 0) {
      throw new Error('No supported code files found in the repository.');
    }

    // 4. Fetch content of files
    console.log(`Fetching content for ${codeFiles.length} files...`);
    const fileContents = await Promise.all(
      codeFiles.map(async (file: any) => {
        try {
          const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: file.path || '',
          });

          if ('content' in data && data.encoding === 'base64') {
            const content = Buffer.from(data.content as string, 'base64').toString('utf-8');
            return `File: ${file.path}\n\n${content}\n\n---\n`;
          }
          return '';
        } catch (err: any) {
          console.warn(`Could not fetch ${file.path}:`, err.message);
          return '';
        }
      })
    );

    const combinedCode = fileContents.join('\n');

    // 5. AI Analysis
    console.log('Sending to Anthropic...');
    const prompt = `
      Analyze the following codebase from repository "${repo}".
      Provide a professional code review in JSON format.
      
      Code Snippets:
      ${combinedCode.substring(0, 15000)}

      Return JSON:
      {
        "score": number (0-10),
        "bestPractices": number (0-100),
        "security": "Low" | "Medium" | "High",
        "feedback": string[],
        "topLanguages": string[]
      }
    `;

    const result = await callAnthropic(
      [{ role: "user", content: prompt }],
      "You are an elite AI Code Architect.",
      { type: "json_object" }
    );

    console.log('AI Analysis complete.');

    // 6. Save to Supabase (Optional - depends on table existence)
    try {
      console.log('Saving to database...');
      const { data: analysisData, error: analysisError } = await supabase
        .from('repo_analyses')
        .insert({
          repo_url: repoUrl,
          repo_name: repo,
          score: result.score,
          details: result
        })
        .select()
        .single();

      if (analysisError) {
        console.warn('Supabase Error (repo_analyses):', analysisError.message);
      } else {
        await supabase.from('activities').insert({
          title: 'Repo Analyzed',
          description: `${repo} reached ${result.score}/10`,
          type: 'repo_analysis'
        });
      }
    } catch (dbError: any) {
      console.warn('Could not save to database:', dbError.message);
    }

    return result;
  } catch (error: any) {
    console.error('❌ Service Error Details:', error);
    throw error;
  }
}
