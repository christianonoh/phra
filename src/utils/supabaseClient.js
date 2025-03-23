import { createClient } from "@supabase/supabase-js";

// Ensure you use environment variables properly
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "your-default-url";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-default-key";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
