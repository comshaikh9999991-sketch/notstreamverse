// ============================================
// StreamVerse - Authentication Module
// ============================================

class Auth {
    constructor() {
        this.isAdmin = false;
        this.adminKey = 'streamverse_admin';
        this.checkAuth();
    }

    checkAuth() {
        const stored = sessionStorage.getItem(this.adminKey);
        if (stored === 'true') {
            this.isAdmin = true;
        }
    }

    async login(email, password) {
        // If Supabase is configured, use it
        if (isSupabaseConfigured() && supabase) {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                if (error) throw error;
                this.isAdmin = true;
                sessionStorage.setItem(this.adminKey, 'true');
                return { success: true };
            } catch (error) {
                return { success: false, message: error.message };
            }
        }

        // Local fallback authentication
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            this.isAdmin = true;
            sessionStorage.setItem(this.adminKey, 'true');
            return { success: true };
        }

        return { success: false, message: 'Invalid email or password' };
    }

    async logout() {
        if (isSupabaseConfigured() && supabase) {
            await supabase.auth.signOut();
        }
        this.isAdmin = false;
        sessionStorage.removeItem(this.adminKey);
    }

    getIsAdmin() {
        return this.isAdmin;
    }
}

const auth = new Auth();