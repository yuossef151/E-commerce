import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qscplwqrukaoyamlgjvs.supabase.co';

const SUPABASE_ANON_KEY = 'sb_publishable_z_gUtofKylYG6rQj2qzhdA_bjCrBhqc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);