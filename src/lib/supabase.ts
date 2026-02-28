import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and Anon Key when available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("⚠️ SECURITY WARNING (SEC-005): Supabase Environment Variables are missing. Using local mock mode.");
}

export const supabase = createClient(
    supabaseUrl || 'https://mock.supabase.co',
    supabaseAnonKey || 'mock-key' // These are strictly mock strings, not real keys
);
