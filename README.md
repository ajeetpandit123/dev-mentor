# DevMentor AI 🚀

DevMentor AI is a production-ready developer mentorship platform that leverages AI to provide personalized feedback, skill gap analysis, and learning roadmaps.

## Features

- **GitHub Repo Analyzer**: Get instant feedback on your code quality and best practices.
- **AI Code Review**: Detailed analysis of performance, security, and quality.
- **Skill Gap Analyzer**: Identify what you need to learn to reach the next level.
- **Personalized Roadmaps**: AI-generated weekly learning plans.
- **Resume Analyzer**: ATS optimization and feedback for your professional profile.
- **Growth Dashboard**: Track your progress and scores over time.
- **AI Mentor Chat**: A context-aware chat assistant that knows your projects and skills.

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion.
- **Backend**: Next.js API Routes.
- **Database/Auth**: Supabase.
- **AI**: OpenAI API.

## Setup Instructions

1. **Clone the repository** (if applicable) or navigate to the project directory.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Variables**:
   Create a `.env.local` file with the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   GITHUB_ACCESS_TOKEN=your_github_token
   ```
4. **Database Setup**:
   Run the SQL schema provided in `supabase/schema.sql` in your Supabase SQL editor.
5. **Run the development server**:
   ```bash
   npm run dev
   ```

## Database Schema

The database consists of the following tables:
- `profiles`: User information.
- `projects`: Analyzed GitHub repositories.
- `resumes`: Analyzed resumes and ATS scores.
- `skills`: User skill levels.
- `roadmaps`: Personalized learning paths.
- `chat_history`: Persistent AI mentor conversations.
