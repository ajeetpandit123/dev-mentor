import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixTable() {
  console.log('Adding unique constraint to roadmaps(user_id)...');
  const { error } = await supabase.rpc('execute_sql', {
    sql_query: 'ALTER TABLE roadmaps ADD CONSTRAINT roadmaps_user_id_key UNIQUE (user_id);'
  });
  
  if (error) {
    console.error('Error:', error);
    // If RPC failed, maybe we can just do a normal query if we have permissions, 
    // but usually execute_sql is a custom RPC.
  } else {
    console.log('Success!');
  }
}

// fixTable(); 
// Actually, I don't have execute_sql RPC by default.
// I'll just try to handle the 500 in the code for now by checking for existing records manually.
