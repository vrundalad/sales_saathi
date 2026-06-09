import { supabase, authHelper } from '../src/lib/supabase.js';

// Toggle password visibility function (global so it works with inline onclick)
window.toggleVisibility = function(targetId, btnElement) {
    const input = document.getElementById(targetId);
    const eyeIcon = btnElement.querySelector('.eye-icon');
    const eyeOffIcon = btnElement.querySelector('.eye-off-icon');

    if (input.type === 'password') {
        input.type = 'text';
        eyeIcon.classList.add('hidden');
        eyeOffIcon.classList.remove('hidden');
    } else {
        input.type = 'password';
        eyeIcon.classList.remove('hidden');
        eyeOffIcon.classList.add('hidden');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // LOGOUT SUCCESS MESSAGE HANDLING
    // -------------------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('logout') === 'success') {
        const loginSuccessAlert = document.getElementById('loginSuccessAlert');
        if (loginSuccessAlert) {
            loginSuccessAlert.textContent = "Logged out successfully.";
            loginSuccessAlert.classList.remove('hidden');
            // Clean up the URL without reloading the page
            window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
        }
    }
    // -------------------------------------------------------------
    // SIGNUP LOGIC (Using the shared authHelper)
    // -------------------------------------------------------------
    const signupForm = document.getElementById('supabaseSignupForm');
    
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Elements
            const fullNameInput = document.getElementById('signupFullName');
            const emailInput = document.getElementById('signupEmail');
            const passwordInput = document.getElementById('signupPassword');
            const confirmPasswordInput = document.getElementById('signupConfirmPassword');
            const submitBtn = document.getElementById('signupSubmitBtn');
            const btnText = document.getElementById('signupBtnText');
            const spinner = document.getElementById('signupSpinner');
            
            // Error blocks
            const errorAlert = document.getElementById('signupErrorAlert');
            const successAlert = document.getElementById('signupSuccessAlert');
            const fullNameError = document.getElementById('signupFullNameError');
            const emailError = document.getElementById('signupEmailError');
            const passwordError = document.getElementById('signupPasswordError');
            const confirmPasswordError = document.getElementById('signupConfirmPasswordError');
            
            // Reset state
            errorAlert.classList.add('hidden');
            successAlert.classList.add('hidden');
            fullNameError.classList.add('hidden');
            emailError.classList.add('hidden');
            passwordError.classList.add('hidden');
            confirmPasswordError.classList.add('hidden');

            const fullName = fullNameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            let isValid = true;
            
            if (!fullName) {
                fullNameError.textContent = "Full name is required.";
                fullNameError.classList.remove('hidden');
                isValid = false;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
                emailError.textContent = "Please enter a valid email address.";
                emailError.classList.remove('hidden');
                isValid = false;
            }
            
            if (password.length < 8) {
                passwordError.textContent = "Password must be at least 8 characters.";
                passwordError.classList.remove('hidden');
                isValid = false;
            }
            
            if (password !== confirmPassword) {
                confirmPasswordError.textContent = "Passwords do not match.";
                confirmPasswordError.classList.remove('hidden');
                isValid = false;
            }
            
            if (!isValid) return;
            
            // Loading state
            submitBtn.disabled = true;
            btnText.classList.add('hidden');
            spinner.classList.remove('hidden');
            
            try {
                // 1. Supabase Auth Signup
                const { data: authData, error: authError } = await authHelper.signUp(email, password, { full_name: fullName });
                
                if (authError) {
                    throw new Error(authError.message);
                }
                
                // Supabase security feature: If user exists, it returns success but empty identities array
                // and does NOT send a new email. We must catch this to prevent silent failure.
                if (authData?.user?.identities && authData.user.identities.length === 0) {
                    throw new Error("Email is already registered. Please log in.");
                }
                
                // 2. Save user profile in public.users table
                if (authData?.user) {
                    const { error: profileError } = await supabase
                        .from('users')
                        .insert([{
                            id: authData.user.id,
                            full_name: fullName,
                            email: email,
                            created_at: new Date().toISOString()
                        }]);
                        
                    if (profileError) {
                        console.error('Error saving user profile:', profileError);
                    }
                }
                
                // Success
                successAlert.textContent = "Account created successfully. Please verify your email.";
                successAlert.classList.remove('hidden');
                
                // Store email temporarily so verify page knows who to verify
                sessionStorage.setItem('verifyEmail', email);
                
                // Redirect user to the verification pending page
                setTimeout(() => {
                    window.location.href = 'verify.html';
                }, 2000);
                
            } catch (error) {
                // Determine user-friendly error message
                let msg = error.message;
                if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('user already exists')) {
                    msg = "Email is already registered.";
                }
                
                errorAlert.textContent = msg;
                errorAlert.classList.remove('hidden');
                
                // Restore button state
                submitBtn.disabled = false;
                btnText.classList.remove('hidden');
                spinner.classList.add('hidden');
            }
        });
    }

    // -------------------------------------------------------------
    // LOGIN LOGIC (Using the shared authHelper)
    // -------------------------------------------------------------
    const loginForm = document.getElementById('supabaseLoginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById('loginEmail');
            const passwordInput = document.getElementById('loginPassword');
            const submitBtn = document.getElementById('loginSubmitBtn');
            const btnText = document.getElementById('loginBtnText');
            const spinner = document.getElementById('loginSpinner');
            const errorAlert = document.getElementById('loginErrorAlert');
            
            errorAlert.classList.add('hidden');

            const email = emailInput.value.trim();
            const password = passwordInput.value;
            
            if (!email || !password) {
                errorAlert.textContent = "Email and password are required.";
                errorAlert.classList.remove('hidden');
                return;
            }
            
            // Show loading spinner
            submitBtn.disabled = true;
            btnText.classList.add('hidden');
            spinner.classList.remove('hidden');
            
            try {
                // 1. Sign In using authHelper
                const { data: authData, error: authError } = await authHelper.login(email, password);
                
                if (authError) {
                    // Check if the user needs to verify their email
                    if (authError.message.toLowerCase().includes("email not confirmed")) {
                        throw new Error("Please verify your email before logging in.");
                    }
                    // For all other errors (e.g. invalid credentials), show standard message
                    throw new Error("Invalid email or password.");
                }
                

                
                // 2. Check subscription status to determine redirection
                const { data: sub } = await supabase.from('subscriptions').select('plan_type').eq('user_id', authData.user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
                
                if (sub && sub.plan_type) {
                    localStorage.setItem('_x_userPlan', JSON.stringify(sub.plan_type));
                    window.location.href = '/dashboard.html';
                } else {
                    window.location.href = '/pricing.html';
                }
                
            } catch (error) {
                // Display the specific error message generated above
                errorAlert.textContent = error.message;
                errorAlert.classList.remove('hidden');
                
                // Remove loading spinner
                submitBtn.disabled = false;
                btnText.classList.remove('hidden');
                spinner.classList.add('hidden');
            }
        });
    }
});

