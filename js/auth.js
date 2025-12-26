// Authentication Module
import { app, auth } from './app.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Initialize auth tabs
document.addEventListener('DOMContentLoaded', () => {
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Remove active class from all tabs and forms
            authTabs.forEach(t => t.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding form
            tab.classList.add('active');
            document.getElementById(`${targetTab}Form`).classList.add('active');
        });
    });

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Google login buttons
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const googleRegisterBtn = document.getElementById('googleRegisterBtn');
    
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleAuth);
    }
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', handleGoogleAuth);
    }
});

// Handle email/password login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const message = document.getElementById('loginMessage');

    try {
        await signInWithEmailAndPassword(auth, email, password);
        message.textContent = 'Login successful!';
        message.className = 'auth-message success';
        
        // Close modal after short delay
        setTimeout(() => {
            document.getElementById('authModal').classList.remove('active');
            message.textContent = '';
        }, 1500);
    } catch (error) {
        console.error('Login error:', error);
        message.textContent = getErrorMessage(error.code);
        message.className = 'auth-message error';
    }
}

// Handle email/password registration
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const message = document.getElementById('registerMessage');

    if (password.length < 6) {
        message.textContent = 'Password must be at least 6 characters long.';
        message.className = 'auth-message error';
        return;
    }

    try {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile with display name
        await updateProfile(user, {
            displayName: name
        });

        // Save user data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            name: name,
            email: email,
            createdAt: new Date(),
            role: 'customer'
        });

        message.textContent = 'Registration successful!';
        message.className = 'auth-message success';
        
        // Close modal after short delay
        setTimeout(() => {
            document.getElementById('authModal').classList.remove('active');
            message.textContent = '';
        }, 1500);
    } catch (error) {
        console.error('Registration error:', error);
        message.textContent = getErrorMessage(error.code);
        message.className = 'auth-message error';
    }
}

// Handle Google authentication
async function handleGoogleAuth() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user document exists, if not create one
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: new Date(),
            role: 'customer'
        }, { merge: true }); // merge: true prevents overwriting existing data

        // Close modal
        document.getElementById('authModal').classList.remove('active');
    } catch (error) {
        console.error('Google auth error:', error);
        const message = document.getElementById('loginMessage');
        message.textContent = getErrorMessage(error.code);
        message.className = 'auth-message error';
    }
}

// Logout function
export async function logout() {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out. Please try again.');
    }
}

// Get user-friendly error messages
function getErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please log in instead.';
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/operation-not-allowed':
            return 'Operation not allowed. Please contact support.';
        case 'auth/weak-password':
            return 'Password is too weak. Please use at least 6 characters.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/invalid-credential':
            return 'Invalid email or password.';
        case 'auth/popup-closed-by-user':
            return 'Sign in was cancelled.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection.';
        default:
            return 'An error occurred. Please try again.';
    }
}

// Check if user is admin
export async function isAdmin(user) {
    if (!user) return false;
    
    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        return userDoc.exists() && userDoc.data().role === 'admin';
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}
