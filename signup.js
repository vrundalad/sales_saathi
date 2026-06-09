import { authHelper, supabase } from './src/lib/supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('signupForm');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner-icon');
    
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    
    const toast = document.getElementById('toast');

    // Validation Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Toggle Password Visibility
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const inputField = document.getElementById(targetId);
            const eyeIcon = this.querySelector('.eye-icon');
            const eyeOffIcon = this.querySelector('.eye-off-icon');

            if (inputField.type === 'password') {
                inputField.type = 'text';
                eyeIcon.classList.add('hidden');
                eyeOffIcon.classList.remove('hidden');
            } else {
                inputField.type = 'password';
                eyeIcon.classList.remove('hidden');
                eyeOffIcon.classList.add('hidden');
            }
        });
    });

    // Helper: Show Error
    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        const errorMsg = formGroup.querySelector('.error-msg');
        
        formGroup.classList.add('error', 'shake');
        errorMsg.textContent = message;

        // Remove shake animation class after it completes so it can be triggered again
        setTimeout(() => {
            formGroup.classList.remove('shake');
        }, 500);
    }

    // Helper: Clear Error
    function clearError(input) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.remove('error');
    }

    // Clear error on input change
    [fullNameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
        input.addEventListener('input', () => {
            clearError(input);
        });
    });

    // Form Submit Handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;

        // 1. Validate Full Name
        if (!fullNameInput.value.trim()) {
            showError(fullNameInput, 'Full name is required.');
            isValid = false;
        }

        // 2. Validate Email
        const emailValue = emailInput.value.trim();
        if (!emailValue) {
            showError(emailInput, 'Work email is required.');
            isValid = false;
        } else if (!emailRegex.test(emailValue)) {
            showError(emailInput, 'Please enter a valid email address.');
            isValid = false;
        }

        // 3. Validate Password
        const passwordValue = passwordInput.value;
        if (!passwordValue) {
            showError(passwordInput, 'Password is required.');
            isValid = false;
        } else if (passwordValue.length < 8) {
            showError(passwordInput, 'Password must be at least 8 characters.');
            isValid = false;
        }

        // 4. Validate Confirm Password
        const confirmPasswordValue = confirmPasswordInput.value;
        if (!confirmPasswordValue) {
            showError(confirmPasswordInput, 'Please confirm your password.');
            isValid = false;
        } else if (confirmPasswordValue !== passwordValue) {
            showError(confirmPasswordInput, 'Passwords do not match.');
            isValid = false;
        }

        // If validation fails, stop execution
        if (!isValid) return;

        // Proceed with Supabase Auth Call
        handleSignup(fullNameInput.value, emailValue, passwordValue);
    });

    // Supabase Signup API Call
    async function handleSignup(name, email, password) {
        // UI Loading State
        submitBtn.disabled = true;
        btnText.textContent = 'Processing...';
        spinner.classList.remove('hidden');

        try {
            const { data, error } = await authHelper.signUp(email, password, { full_name: name });

            if (error) {
                if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('user already exists')) {
                    showError(emailInput, 'Email is already registered.');
                } else if (error.message.toLowerCase().includes('password')) {
                    showError(passwordInput, error.message);
                } else {
                    showError(emailInput, error.message);
                }
                throw error;
            }

            // Save profile into public.users table
            if (data?.user) {
                const { error: profileError } = await supabase
                    .from('users')
                    .insert([{
                        id: data.user.id,
                        full_name: name,
                        email: email,
                        // Note: created_at is typically handled by database defaults, but we provide it just in case
                        created_at: new Date().toISOString()
                    }]);
                
                if (profileError) {
                    console.error('Error saving user profile:', profileError.message);
                }
            }

            // Reset Button State
            submitBtn.disabled = false;
            btnText.textContent = 'Sign Up';
            spinner.classList.add('hidden');

            // Reset Form
            form.reset();
            
            // Show Success Notification
            // Assuming toast contains a text node or we can just safely append/replace it
            const toastMessage = toast.querySelector('span, p') || toast;
            toastMessage.textContent = 'Account created successfully. Please verify your email.';
            showToast();
            
            // Redirect user to a Verification Pending page
            setTimeout(() => {
                window.location.href = 'verify.html';
            }, 2000);
            
        } catch (error) {
            // Reset Button State on Error
            submitBtn.disabled = false;
            btnText.textContent = 'Sign Up';
            spinner.classList.add('hidden');
        }
    }

    // Success Toast Logic
    function showToast() {
        toast.classList.add('show');
        
        // Hide toast after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }
});
