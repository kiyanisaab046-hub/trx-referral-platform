import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  console.log("Fetching users...");
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (error) {
    console.error("Error fetching users:", error);
  } else {
    console.log("Users fetched successfully:", data);
  }
}

testFetch();
