import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eplbpnkzueunbqlsrokc.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_pJ-lKsoQD_EHRrByLgt7pw_S5YzgEF1'
);
