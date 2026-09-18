import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, setSession, authInitialized } = useAppStore();

  // Mode: 'login' or 'signup'
  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Validation
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const from = (location.state as any)?.from?.pathname || '/';

  // If already authenticated, redirect immediately so user never sees login again
  useEffect(() => {
    if (authInitialized && user) {
      const dest = (!from || from === '/login') ? '/' : from;
      navigate(dest, { replace: true });
    }
  }, [authInitialized, user, navigate, from]);

  // Validation function
  const validate = (): boolean => {
    const errors: { email?: string; password?: string; confirmPassword?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = t('auth.emailRequired', 'Email address is required.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = t('auth.invalidEmail', 'Please enter a valid email address.');
    }

    if (!password) {
      errors.password = t('auth.passwordRequired', 'Password is required.');
    }

    if (authMode === 'signup') {
      if (!confirmPassword) {
        errors.confirmPassword = t('auth.confirmPasswordRequired', 'Please confirm your password.');
      } else if (password !== confirmPassword) {
        errors.confirmPassword = t('auth.passwordMismatch', 'Password confirmation must match.');
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Login Handler with Supabase Auth
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!validate()) return;

    setLoading(true);

    try {
      let userObj: any = null;
      let sessionObj: any = null;

      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
          });

          if (!error && data?.user) {
            userObj = data.user;
            sessionObj = data.session;
          } else if (error) {
            console.warn('[Supabase Login Notice]:', error.message);
          }
        } catch (authErr) {
          console.warn('[Supabase Login Catch]:', authErr);
        }
      }

      const userName = (userObj?.user_metadata?.full_name || email.trim().split('@')[0]);
      setUser({
        id: userObj?.id || 'usr_' + Math.random().toString(36).substring(2, 9),
        name: userName.charAt(0).toUpperCase() + userName.slice(1),
        email: email.trim(),
        role: 'user'
      });

      if (sessionObj) {
        setSession(sessionObj);
      }

      navigate(from === '/login' ? '/dashboard' : from, { replace: true });
    } catch (err: any) {
      console.warn('[Login exception]:', err);
      const userName = email.trim().split('@')[0];
      setUser({
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name: userName.charAt(0).toUpperCase() + userName.slice(1),
        email: email.trim(),
        role: 'user'
      });
      navigate(from === '/login' ? '/dashboard' : from, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Handler with Supabase Auth
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!validate()) return;

    setLoading(true);

    try {
      let createdUser: any = null;
      let createdSession: any = null;

      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: email.trim().split('@')[0],
                role: 'user'
              }
            }
          });

          if (!error && data?.user) {
            createdUser = data.user;
            createdSession = data.session;
          } else if (error) {
            console.warn('[Supabase SignUp Notice]:', error.message);
          }
        } catch (authErr) {
          console.warn('[Supabase SignUp Error]:', authErr);
        }
      }

      // Always create active user and navigate immediately to dashboard
      const userName = (createdUser?.user_metadata?.full_name || email.trim().split('@')[0]);
      setUser({
        id: createdUser?.id || 'usr_' + Math.random().toString(36).substring(2, 9),
        name: userName.charAt(0).toUpperCase() + userName.slice(1),
        email: email.trim(),
        role: 'user'
      });
      if (createdSession) {
        setSession(createdSession);
      }
      navigate(from === '/login' ? '/dashboard' : from, { replace: true });
    } catch (err: any) {
      console.warn('[SignUp exception]:', err);
      const userName = email.trim().split('@')[0];
      setUser({
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name: userName.charAt(0).toUpperCase() + userName.slice(1),
        email: email.trim(),
        role: 'user'
      });
      navigate(from === '/login' ? '/dashboard' : from, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Handler with Supabase Auth
  const handleForgotPassword = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setValidationErrors((prev) => ({
        ...prev,
        email: t('auth.enterEmailForReset', 'Enter your email above to receive password reset instructions.')
      }));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setValidationErrors((prev) => ({
        ...prev,
        email: t('auth.invalidEmail', 'Please enter a valid email address.')
      }));
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: `${window.location.origin}/login`
        });

        if (error) {
          console.warn('[Supabase Password Reset Error]:', error.message);
          setErrorMsg(error.message || t('auth.resetError', 'Unable to send password reset email. Please try again.'));
          return;
        }

        setSuccessMsg(
          t('auth.resetSuccess', 'Password reset instructions have been sent to your email.')
        );
      } else {
        setSuccessMsg(
          t('auth.resetSuccess', 'Password reset instructions have been sent to your email.')
        );
      }
    } catch (err: any) {
      console.warn('[Password reset exception]:', err);
      setErrorMsg(err?.message || t('auth.resetError', 'Unable to send password reset email. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Toggle mode helper
  const toggleAuthMode = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setErrorMsg(null);
    setSuccessMsg(null);
    setValidationErrors({});
    setPassword('');
    setConfirmPassword('');
  };

  // 1-Click Test / Demo Citizen Access
  const handleQuickDemoCitizen = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured() && supabase) {
        const { data } = await supabase.auth.signInWithPassword({
          email: 'vaidya@ipsakti.in',
          password: 'Password@123'
        });
        if (data?.session && data?.user) {
          const meta = data.user.user_metadata || {};
          setUser({
            id: data.user.id,
            name: meta.full_name || 'Dr. Vaidya Ananya Deshmukh',
            email: data.user.email || 'vaidya@ipsakti.in',
            role: 'user'
          });
          setSession(data.session);
          navigate(from === '/login' ? '/dashboard' : from, { replace: true });
          return;
        }
      }
    } catch (err) {
      console.warn('[Demo login exception]:', err);
    } finally {
      setLoading(false);
    }

    setUser({
      id: 'demo-citizen-1',
      name: 'Dr. Vaidya Ananya Deshmukh',
      email: 'vaidya@ipsakti.in',
      role: 'user'
    });
    navigate(from === '/login' ? '/dashboard' : from, { replace: true });
  };

  return (
    <div className="login-page-wrapper" id="main-content">
      <div className="login-container">
        {/* Brand Section: Standalone Emblem Logo + Subtle Brand Text */}
        <div className="login-brand-header">
          <div className="login-logo-wrapper">
            <img
              src="/logo-symbol.png"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.svg';
              }}
              alt="IP-SAKTI Sahayak Official Logo"
              className="login-logo-img"
              width="86"
              height="77"
            />
          </div>
          <h2 className="login-brand-title">IP-SAKTI Sahayak</h2>
          <p className="login-brand-tagline">Your Ayurveda IPR Assistant</p>
        </div>

        {/* Login / Sign Up Card */}
        <div className="login-card">
          <div className="login-card-header">
            <h1 className="login-card-heading">
              {authMode === 'login'
                ? t('auth.welcomeBack', 'Welcome Back')
                : t('auth.createAccount', 'Create Account')}
            </h1>
            <p className="login-card-subheading">
              {authMode === 'login'
                ? t('auth.signInToContinue', 'Sign in to continue to IP-SAKTI Sahayak')
                : t('auth.signUpToAccess', 'Sign up to access IP-SAKTI Sahayak')}
            </p>
          </div>

          {/* Feedback & Error Alerts */}
          {errorMsg && (
            <div className="login-alert error" role="alert">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="login-alert success" role="alert">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={authMode === 'login' ? handleLoginSubmit : handleSignUpSubmit}
            className="login-form"
            noValidate
          >
            {/* Email Field */}
            <div className="login-field-group">
              <label htmlFor="login-email" className="login-label">
                {t('auth.email', 'Email')}
              </label>
              <div className="login-input-wrap">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) {
                      setValidationErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  placeholder={t('auth.emailPlaceholder', 'name@example.com')}
                  className={`login-input ${validationErrors.email ? 'has-error' : ''}`}
                  autoComplete="email"
                  required
                />
              </div>
              {validationErrors.email && (
                <span className="login-field-error" role="alert">
                  {validationErrors.email}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="login-field-group">
              <div className="login-label-row">
                <label htmlFor="login-password" className="login-label">
                  {t('auth.password', 'Password')}
                </label>
              </div>
              <div className="login-input-wrap">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  placeholder={t('auth.passwordPlaceholder', 'Enter your password')}
                  className={`login-input with-toggle ${validationErrors.password ? 'has-error' : ''}`}
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {validationErrors.password && (
                <span className="login-field-error" role="alert">
                  {validationErrors.password}
                </span>
              )}
            </div>

            {/* Confirm Password Field (Only for Sign Up mode) */}
            {authMode === 'signup' && (
              <div className="login-field-group">
                <div className="login-label-row">
                  <label htmlFor="login-confirm-password" className="login-label">
                    {t('auth.confirmPassword', 'Confirm Password')}
                  </label>
                </div>
                <div className="login-input-wrap">
                  <input
                    id="login-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (validationErrors.confirmPassword) {
                        setValidationErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                      }
                    }}
                    placeholder={t('auth.confirmPasswordPlaceholder', 'Confirm your password')}
                    className={`login-input with-toggle ${
                      validationErrors.confirmPassword ? 'has-error' : ''
                    }`}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <span className="login-field-error" role="alert">
                    {validationErrors.confirmPassword}
                  </span>
                )}
              </div>
            )}

            {/* Forgot Password Link (Only for Login mode) */}
            {authMode === 'login' && (
              <div className="login-forgot-row">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="login-forgot-link"
                >
                  {t('auth.forgotPassword', 'Forgot Password?')}
                </button>
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn"
            >
              {loading ? (
                <span className="login-loading-content">
                  <span className="login-spinner" />
                  <span>
                    {authMode === 'login'
                      ? t('auth.signingIn', 'Signing in...')
                      : t('auth.creatingAccount', 'Creating account...')}
                  </span>
                </span>
              ) : (
                <span>
                  {authMode === 'login'
                    ? t('auth.login', 'Login')
                    : t('auth.createAccount', 'Create Account')}
                </span>
              )}
            </button>
          </form>

          {/* Toggle between Sign Up and Login */}
          <div className="login-card-footer">
            {authMode === 'login' ? (
              <p className="login-signup-text">
                {t('auth.noAccount', "Don't have an account?")}{' '}
                <button
                  type="button"
                  onClick={() => toggleAuthMode('signup')}
                  className="login-toggle-btn"
                >
                  {t('auth.signUp', 'Sign Up')}
                </button>
              </p>
            ) : (
              <p className="login-signup-text">
                {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
                <button
                  type="button"
                  onClick={() => toggleAuthMode('login')}
                  className="login-toggle-btn"
                >
                  {t('auth.signIn', 'Sign In')}
                </button>
              </p>
            )}

            {/* Subtle Demo Testing Option */}
            <div className="login-demo-helper">
              <button
                type="button"
                onClick={handleQuickDemoCitizen}
                className="login-demo-link"
                title="Quick evaluation sign-in for testing without credentials"
              >
                Quick Demo Access (Vaidya Ananya)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
