import { supabase } from '../src/lib/supabase';

async function checkTables() {
  const tables = ['profiles', 'repo_analyses', 'resume_analyses', 'activities'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table ${table} does not exist or error: ${error.message}`);
    } else {
      console.log(`Table ${table} exists!`);
    }
  }
}

checkTables();
