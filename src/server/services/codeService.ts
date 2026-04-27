import { octokit } from '@/lib/octokit';
import { openai } from '@/lib/openai';

export async function analyzeRepository(repoUrl: string) {
  try {
    const urlParts = repoUrl.replace('https://github.com/', '').split('/');
    const owner = urlParts[0];
    const repo = urlParts[1];

    if (!owner || !repo) {
      throw new Error('Invalid GitHub URL');
    }

    // 1. Get Repo Data
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    const defaultBranch = repoData.default_branch;

    // 2. Get File Tree
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

    // 4. Fetch content of files
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
        } catch {
          return '';
        }
      })
    );

    const combinedCode = fileContents.join('\n');

    // 5. AI Analysis
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

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "system", content: "You are an elite AI Code Architect." }, { role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error: any) {
    console.error('Service Error:', error);
    throw error;
  }
}
