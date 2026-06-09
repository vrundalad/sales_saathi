// Configuration: Replace these with your actual Supabase project URL and anon key
const SUPABASE_URL = 'https://kqkhmovaomwsdiufgigb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtxa2htb3Zhb213c2RpdWZnaWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzQ4NTksImV4cCI6MjA5NjA1MDg1OX0.qr83zeXyLdZpCGOjgn3XFVm_8oF0wT_ttbVNccdr9Kc';
const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/27813045/4bwav19/';

// Initialize Supabase Client
let supabaseClient = null;
try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
    console.error("Supabase Initialization Error. Did you replace the placeholder keys?");
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    let emailParam = urlParams.get('email');
    
    // Fallback to localStorage if the router stripped query params
    if (!emailParam) {
        emailParam = localStorage.getItem('verification_email');
    }
    
    const emailInput = document.getElementById('verifyEmail');
    if (emailInput && emailParam) {
        emailInput.value = emailParam;
    } else if (emailInput) {
        // Fallback if no email in URL
        emailInput.placeholder = "No email provided";
    }

    const verifyForm = document.getElementById('verifyForm');
    const resendBtn = document.getElementById('resendOtpBtn');

    if (verifyForm) {
        verifyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            verifyOTP();
        });
    }

    if (resendBtn) {
        resendBtn.addEventListener('click', resendOTP);
    }
});

async function verifyOTP() {
    const emailInput = document.getElementById('verifyEmail');
    const otpInput = document.getElementById('verifyOtpCode');
    const verifyBtn = document.getElementById('verifyBtn');
    const btnText = document.getElementById('verifyBtnText');
    const spinner = document.getElementById('verifySpinner');
    const errorAlert = document.getElementById('verifyErrorAlert');
    const successAlert = document.getElementById('verifySuccessAlert');
    const otpError = document.getElementById('otpCodeError');

    // Reset states
    errorAlert.classList.add('hidden');
    successAlert.classList.add('hidden');
    otpError.classList.add('hidden');

    if (!supabaseClient) {
        errorAlert.textContent = "System Error: Supabase keys are not configured. Please add your SUPABASE_URL and SUPABASE_ANON_KEY to js/verify-otp.js.";
        errorAlert.classList.remove('hidden');
        return;
    }

    const email = emailInput.value.trim();
    const otpCode = otpInput.value.trim();

    if (!email) {
        errorAlert.textContent = "Email is missing. Please start signup again.";
        errorAlert.classList.remove('hidden');
        return;
    }

    if (!/^\d{6}$/.test(otpCode)) {
        otpError.classList.remove('hidden');
        return;
    }

    // Loading State
    verifyBtn.disabled = true;
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');

    try {
        // Query the email_verifications table for the matching OTP
        const { data, error } = await supabaseClient
            .from('email_verifications')
            .select('*')
            .eq('email', email)
            .eq('otp_code', otpCode)
            .eq('verified', false) // Check verified = false
            .order('created_at', { ascending: false }) // Assuming there's a created_at column
            .limit(1)
            .single();

        if (error || !data) {
            throw new Error("Invalid verification code.");
        }

        // Check expiration
        const now = new Date();
        const expiresAt = new Date(data.expires_at);
        if (now > expiresAt) {
            throw new Error("OTP expired. Request a new code.");
        }

        // Update the verification status
        const { error: updateError } = await supabaseClient
            .from('email_verifications')
            .update({ verified: true })
            .eq('id', data.id); // Assuming there's an id column

        if (updateError) {
            console.error("Failed to update verification status:", updateError);
        }

        // Get the current user to retrieve ID and Full Name
        const { data: userData, error: userError } = await supabaseClient.auth.getUser();
        
        if (!userError && userData && userData.user) {
            const user = userData.user;
            
            // Upsert into profiles table
            const { error: profileError } = await supabaseClient
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: user.user_metadata?.full_name || '',
                    email: email,
                    account_status: 'active'
                }, { onConflict: 'id' });
                
            if (profileError) {
                console.error("Failed to create profile:", profileError);
            }
        } else {
            console.warn("Could not retrieve user session to create profile. Ensure email confirmations are disabled in Supabase if using custom OTP.");
        }

        // Success
        successAlert.textContent = "Account verified successfully.";
        successAlert.classList.remove('hidden');

        // Optional: Call Supabase verifyOtp if you also use Supabase Auth native OTP
        // await supabaseClient.auth.verifyOtp({ email, token: otpCode, type: 'signup' });



        // Redirect to pricing page for next onboarding step
        setTimeout(() => {
            window.location.href = "pricing.html";
        }, 2000);

    } catch (err) {
        errorAlert.textContent = err.message || "An error occurred during verification.";
        errorAlert.classList.remove('hidden');
        
        // Restore button state
        verifyBtn.disabled = false;
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

async function resendOTP() {
    const emailInput = document.getElementById('verifyEmail');
    const resendBtn = document.getElementById('resendOtpBtn');
    const resendSpinner = document.getElementById('resendSpinner');
    const errorAlert = document.getElementById('verifyErrorAlert');
    const successAlert = document.getElementById('verifySuccessAlert');

    const email = emailInput.value.trim();

    if (!supabaseClient) {
        errorAlert.textContent = "System Error: Supabase keys are not configured. Please add your SUPABASE_URL and SUPABASE_ANON_KEY to js/verify-otp.js.";
        errorAlert.classList.remove('hidden');
        return;
    }

    if (!email) {
        errorAlert.textContent = "Email is missing.";
        errorAlert.classList.remove('hidden');
        return;
    }

    // Reset states
    errorAlert.classList.add('hidden');
    successAlert.classList.add('hidden');

    // Loading State
    resendBtn.disabled = true;
    resendBtn.classList.add('hidden');
    resendSpinner.classList.remove('hidden');

    try {
        // Generate new 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Set expiration to 10 minutes from now
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);
        
        // Insert into email_verifications
        const { error: dbError } = await supabaseClient
            .from('email_verifications')
            .insert([{
                email: email,
                otp_code: otpCode,
                verified: false,
                expires_at: expiresAt.toISOString()
            }]);
            
        if (dbError) {
            throw new Error("Failed to generate a new verification code.");
        }

        // Call Zapier Webhook (optional, assuming we need to send email again)
        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('otp_code', otpCode);

            await fetch(ZAPIER_WEBHOOK_URL, {
                method: 'POST',
                body: formData
            });
        } catch (webhookError) {
            console.error("Failed to send webhook to Zapier:", webhookError);
        }

        // Success
        successAlert.textContent = "A new verification code has been sent to your email.";
        successAlert.classList.remove('hidden');

    } catch (err) {
        errorAlert.textContent = err.message || "Failed to resend code.";
        errorAlert.classList.remove('hidden');
    } finally {
        // Restore button state
        resendSpinner.classList.add('hidden');
        resendBtn.classList.remove('hidden');
        
        // Add a cooldown to the button (e.g. 60 seconds)
        let cooldown = 60;
        const originalText = resendBtn.textContent;
        
        const interval = setInterval(() => {
            resendBtn.textContent = `Resend in ${cooldown}s`;
            if (cooldown <= 0) {
                clearInterval(interval);
                resendBtn.textContent = originalText;
                resendBtn.disabled = false;
            }
            cooldown--;
        }, 1000);
    }
}
