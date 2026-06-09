import dotenv from 'dotenv';
dotenv.config();

import { supabase, authHelper } from './src/lib/supabase.js';

async function verify() {
    console.log("Verifying connection to Supabase Auth...");
    
    // Auth test
    try {
        const { session, error: sessionError } = await authHelper.getCurrentSession();
        if (sessionError) throw sessionError;
        console.log("Authentication connection successful (No active session expected).");
    } catch (e) {
        console.error("Failed to connect to Supabase Auth:", e.message);
    }

    console.log("Verifying connection to public.users table...");
    try {
        const { data, error } = await supabase.from('users').select('*').limit(1);
        if (error) throw error;
        console.log(`Database connection successful. Reached users table.`);
    } catch (e) {
        console.error("Failed to connect to public.users table:", e.message);
    }
}

verify();
