import { createClient } from '@supabase/supabase-js';

// رابط المشروع اللي استخرجناه من الـ Project ID
const SUPABASE_URL = 'https://qscplwqrukaoyamlgjvs.supabase.co';

// الـ Publishable key اللي جبته من إعدادات الـ API Keys في سوبابيز
const SUPABASE_ANON_KEY = 'sb_publishable_z_gUtofKylYG6rQj2qzhdA_bjCrBhqc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);