import { supabase } from '../src/lib/supabase.js';

const AuthGuard = {
    async init() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error || !session) {
                console.warn('AuthGuard: No active session. Redirecting to login.');
                window.location.replace('/auth.html#login');
                return;
            }

            // Optional: You could also check for specific user metadata or roles here
            // if (session.user.user_metadata.role !== 'admin') ...

            // Emit an event to signal that the guard has passed, just in case other scripts need to wait
            document.dispatchEvent(new CustomEvent('auth-guard:passed', { detail: { session } }));
            
        } catch (err) {
            console.error('AuthGuard Error:', err);
            window.location.replace('/auth.html#login');
        }
    }
};

// Run the guard immediately
AuthGuard.init();

export { AuthGuard };
