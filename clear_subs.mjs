import { supabase } from './src/lib/supabase.js';

async function clearSubscriptions() {
    console.log("Clearing subscriptions...");
    const { error } = await supabase.from('subscriptions').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    if (error) {
        console.error("Error clearing subscriptions:", error);
    } else {
        console.log("Subscriptions cleared successfully.");
    }
}

clearSubscriptions();
