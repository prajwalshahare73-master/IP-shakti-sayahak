import { createClient, SupabaseClient, Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { API_CONFIG } from './api.config';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || API_CONFIG.SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || API_CONFIG.SUPABASE_ANON_KEY || '').trim();

export const isValidSupabaseConfig = (url: string, key: string): boolean => {
  if (!url || !key) return false;
  if (url.includes('YOUR_SUPABASE') || key.includes('YOUR_SUPABASE')) return false;
  try {
    const parsed = new URL(url);
    return Boolean(parsed.protocol && parsed.host);
  } catch {
    return false;
  }
};

const isLiveConfigured = isValidSupabaseConfig(supabaseUrl, supabaseAnonKey);

// Storage keys for simulated local session when live keys are pending
const MOCK_SESSION_STORAGE_KEY = 'ipsakti_supabase_session';
const MOCK_USERS_STORAGE_KEY = 'ipsakti_registered_users';

type AuthListener = (event: AuthChangeEvent, session: Session | null) => void;
const authListeners: Set<AuthListener> = new Set();

const notifyAuthListeners = (event: AuthChangeEvent, session: Session | null) => {
  authListeners.forEach((listener) => {
    try {
      listener(event, session);
    } catch (e) {
      console.warn('[Supabase Auth Listener Error]:', e);
    }
  });
};

const getStoredMockUsers = (): Record<string, { password: string; name: string; role: string }> => {
  try {
    const raw = localStorage.getItem(MOCK_USERS_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : {};
    // Seed default demo user if not present
    if (!existing['vaidya@ipsakti.in']) {
      existing['vaidya@ipsakti.in'] = {
        password: 'Password@123',
        name: 'Dr. Vaidya Ananya Deshmukh',
        role: 'user'
      };
    }
    return existing;
  } catch {
    return {
      'vaidya@ipsakti.in': {
        password: 'Password@123',
        name: 'Dr. Vaidya Ananya Deshmukh',
        role: 'user'
      }
    };
  }
};

const createMockSession = (email: string, name: string, role: string): Session => {
  const userId = 'usr_' + Math.random().toString(36).substring(2, 11);
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + 3600; // 1 hour

  return {
    access_token: `sb_mock_token_${Date.now()}`,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: expiresAt,
    refresh_token: `sb_mock_refresh_${Date.now()}`,
    user: {
      id: userId,
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: { full_name: name, role },
      aud: 'authenticated',
      confirmation_sent_at: new Date().toISOString(),
      recovery_sent_at: '',
      email_change_sent_at: '',
      new_email: '',
      invited_at: '',
      action_link: '',
      email,
      phone: '',
      created_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString(),
      phone_confirmed_at: '',
      last_sign_in_at: new Date().toISOString(),
      role: 'authenticated',
      updated_at: new Date().toISOString(),
      identities: [],
      factors: []
    }
  };
};

// Create or initialize client
let client: any = null;

if (isLiveConfigured) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      }
    });
    console.log('[Supabase] Initialized live client with project:', supabaseUrl);
  } catch (err) {
    console.warn('[Supabase] Live client initialization failed, falling back to local provider:', err);
  }
}

if (!client) {
  // Seamless standard-compliant fallback provider for testing before cloud credentials are wired
  client = {
    auth: {
      async signInWithPassword({ email, password }: { email: string; password?: string }) {
        const users = getStoredMockUsers();
        const normalizedEmail = email.toLowerCase().trim();
        const match = users[normalizedEmail];

        // Simulate network delay
        await new Promise((res) => setTimeout(res, 250));

        if (
          match &&
          (match.password === password ||
            (normalizedEmail === 'vaidya@ipsakti.in' && (password === 'Password@123' || password === 'Vaidya@123')))
        ) {
          const session = createMockSession(normalizedEmail, match.name, match.role);
          try {
            localStorage.setItem(MOCK_SESSION_STORAGE_KEY, JSON.stringify(session));
          } catch {
            // ignore
          }
          notifyAuthListeners('SIGNED_IN', session);
          return { data: { user: session.user, session }, error: null };
        }

        return {
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials', status: 400 }
        };
      },

      async signUp({
        email,
        password,
        options
      }: {
        email: string;
        password?: string;
        options?: { data?: Record<string, any> };
      }) {
        const users = getStoredMockUsers();
        const normalizedEmail = email.toLowerCase().trim();

        await new Promise((res) => setTimeout(res, 300));

        const fullName = options?.data?.full_name || normalizedEmail.split('@')[0];
        const role = options?.data?.role || 'user';

        users[normalizedEmail] = {
          password: password || '',
          name: fullName,
          role
        };

        try {
          localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users));
        } catch {
          // ignore
        }

        // Standard Supabase behavior: returns user, session is null when email confirmation is required
        const mockUser: User = {
          id: 'usr_' + Math.random().toString(36).substring(2, 11),
          app_metadata: { provider: 'email', providers: ['email'] },
          user_metadata: { full_name: fullName, role },
          aud: 'authenticated',
          confirmation_sent_at: new Date().toISOString(),
          recovery_sent_at: '',
          email_change_sent_at: '',
          new_email: '',
          invited_at: '',
          action_link: '',
          email: normalizedEmail,
          phone: '',
          created_at: new Date().toISOString(),
          confirmed_at: '',
          email_confirmed_at: '',
          phone_confirmed_at: '',
          last_sign_in_at: '',
          role: 'authenticated',
          updated_at: new Date().toISOString(),
          identities: [],
          factors: []
        };

        return { data: { user: mockUser, session: null }, error: null };
      },

      async resetPasswordForEmail(email: string, _options?: { redirectTo?: string }) {
        await new Promise((res) => setTimeout(res, 200));
        return { data: {}, error: null };
      },

      async signOut() {
        try {
          localStorage.removeItem(MOCK_SESSION_STORAGE_KEY);
        } catch {
          // ignore
        }
        notifyAuthListeners('SIGNED_OUT', null);
        return { error: null };
      },

      async getSession() {
        try {
          const raw = localStorage.getItem(MOCK_SESSION_STORAGE_KEY);
          if (raw) {
            const session = JSON.parse(raw);
            return { data: { session }, error: null };
          }
        } catch {
          // ignore
        }
        return { data: { session: null }, error: null };
      },

      onAuthStateChange(callback: AuthChangeEvent | any) {
        authListeners.add(callback);

        // Immediately invoke with current session
        try {
          const raw = localStorage.getItem(MOCK_SESSION_STORAGE_KEY);
          const currentSession = raw ? JSON.parse(raw) : null;
          callback('INITIAL_SESSION' as AuthChangeEvent, currentSession);
        } catch {
          callback('INITIAL_SESSION' as AuthChangeEvent, null);
        }

        return {
          data: {
            subscription: {
              unsubscribe: () => {
                authListeners.delete(callback);
              }
            }
          }
        };
      }
    }
  };
}

export const supabase = client as SupabaseClient;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(client);
};

export const isLiveSupabase = (): boolean => {
  return isLiveConfigured;
};

/**
 * Returns authorization headers with current Supabase Bearer token if session exists.
 * Ready for authenticated FastAPI / RAG backend requests.
 */
export async function getAuthHeader(): Promise<Record<string, string>> {
  if (!client) return {};
  try {
    const {
      data: { session }
    } = await client.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch {
    // ignore
  }
  return {};
}

export type { Session, User };
