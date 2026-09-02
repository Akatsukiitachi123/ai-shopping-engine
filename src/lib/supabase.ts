import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://udzdhzkbvtedyntmrpxk.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_fy-dldocPXNcQGWHT45Uqw_iPOAbxh-";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);