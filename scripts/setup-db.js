import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('[v0] Reading SQL migration files...');
    
    const tablesSQL = fs.readFileSync(
      path.join(process.cwd(), 'scripts/01_create_tables.sql'),
      'utf8'
    );
    
    const rlsSQL = fs.readFileSync(
      path.join(process.cwd(), 'scripts/02_create_rls_policies.sql'),
      'utf8'
    );

    console.log('[v0] Executing table creation script...');
    const { error: tablesError } = await supabase.rpc('exec', { sql: tablesSQL });
    if (tablesError) throw tablesError;

    console.log('[v0] Executing RLS policies script...');
    const { error: rlsError } = await supabase.rpc('exec', { sql: rlsSQL });
    if (rlsError) throw rlsError;

    console.log('[v0] Database setup completed successfully!');
  } catch (error) {
    console.error('[v0] Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
