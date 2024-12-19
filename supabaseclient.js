import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase project details
const SUPABASE_URL = 'https://euaelkwwqtlztdalgnfo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1YWVsa3d3cXRsenRkYWxnbmZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk0MzM3NTAsImV4cCI6MjA0NTAwOTc1MH0.LP4qArmAk05dGpQBUcko5_FGiByMTF8tpOOOZdpY0Cg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
