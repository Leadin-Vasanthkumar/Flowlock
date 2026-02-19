
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zvmahxwyvcoggvmafnqw.supabase.co';
const supabaseKey = 'sb_publishable_Am08l879d0dRQF_QMtiWYA_V8Lmk11k';

export const supabase = createClient(supabaseUrl, supabaseKey);
