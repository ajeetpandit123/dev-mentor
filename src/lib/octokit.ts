import { Octokit } from 'octokit';

const githubToken = process.env.GITHUB_TOKEN;

if (!githubToken) {
  console.warn('GITHUB_TOKEN is missing. Repository analysis will be limited by rate limits.');
}

export const octokit = new Octokit({
  auth: githubToken,
});
