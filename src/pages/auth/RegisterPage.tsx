import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  User,
  Mail,
  Lock,
  Phone,
  Building,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { supabase, isSupabaseConfigured } from '../../services/supabase';

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser, setSession } = useAppStore();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    userType: 'vaidya',
    state: 'Maharashtra',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMsg('You must agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              phone: formData.phone,
              user_type: formData.userType,
              state: formData.state
            }
          }
        });
        if (error) throw error;
        if (data?.session) {
          setUser({
            id: data.user?.id,
            name: formData.fullName,
            email: formData.email,
            role: 'user'
          });
          setSession(data.session);
          navigate('/', { replace: true });
        } else {
          // Email confirmation required
          setErrorMsg(null);
          alert(t('auth.signUpSuccess', 'Account created successfully. Check your email if verification is required.'));
          navigate('/login', { replace: true });
        }
      } else {
        // Mock register fallback
        await new Promise((resolve) => setTimeout(resolve, 600));
        setUser({
          name: formData.fullName || 'New Innovator',
          email: formData.email,
          role: 'user'
        });
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gov-auth-page" id="main-content">
      <div className="gov-container auth-container register-container">
        <div className="gov-card auth-card register-card">
          <div className="auth-header">
            <div className="auth-emblem">
              <Shield size={36} className="text-secondary" />
            </div>
            <h1 className="auth-title">Create AYUR-IP Innovator Account</h1>
            <p className="auth-subtitle">
              Register to create digital formulation dossiers, run TKDL pre-clearance, and connect with empanelled patent attorneys.
            </p>
          </div>

          {errorMsg && (
            <div className="auth-alert error" role="alert">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="auth-form-grid">
            <div className="gov-form-group">
              <label htmlFor="fullName" className="gov-label">
                Full Legal Name / Vaidya Name *
              </label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Raghavendra Kulkarni"
                  className="gov-input"
                />
              </div>
            </div>

            <div className="gov-form-group">
              <label htmlFor="email" className="gov-label">
                Official Email Address *
              </label>
              <div className="input-with-icon">
                <Mail size={18} className="field-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@organization.com"
                  className="gov-input"
                />
              </div>
            </div>

            <div className="gov-form-group">
              <label htmlFor="phone" className="gov-label">
                Mobile Number (for OTP & Case Updates) *
              </label>
              <div className="input-with-icon">
                <Phone size={18} className="field-icon" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="gov-input"
                />
              </div>
            </div>

            <div className="gov-form-group">
              <label htmlFor="userType" className="gov-label">
                Innovator Category *
              </label>
              <div className="input-with-icon">
                <Building size={18} className="field-icon" />
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="gov-input gov-select"
                >
                  <option value="vaidya">Ayurvedic Physician / Vaidya / Practitioner</option>
                  <option value="startup">Ayush Startup / D2C Wellness Enterprise</option>
                  <option value="msme">Ayurvedic Drug Manufacturer (GMP / AYUSH License)</option>
                  <option value="researcher">University Researcher / Academician</option>
                  <option value="individual">Independent Botanical Innovator</option>
                </select>
              </div>
            </div>

            <div className="gov-form-group">
              <label htmlFor="state" className="gov-label">
                Primary Operational State (for SBB / AYUSH Jurisdiction) *
              </label>
              <div className="input-with-icon">
                <MapPin size={18} className="field-icon" />
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="gov-input gov-select"
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Delhi">Delhi NCR</option>
                  <option value="Other">Other State / UT</option>
                </select>
              </div>
            </div>

            <div className="gov-form-group">
              <label htmlFor="reg-password" className="gov-label">
                Create Account Password *
              </label>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" />
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className="gov-input"
                />
              </div>
            </div>

            <div className="gov-form-group">
              <label htmlFor="confirmPassword" className="gov-label">
                Confirm Password *
              </label>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className="gov-input"
                />
              </div>
            </div>

            <div className="gov-form-group full-width">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                />
                <span>
                  I agree to the <strong>Terms of Service</strong>, statutory confidentiality guidelines, and acknowledge that IP-SAKTI guidance constitutes informational support and not final judicial decree.
                </span>
              </label>
            </div>

            <div className="form-submit-row full-width">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-secondary btn-lg btn-block"
              >
                {loading ? (
                  <span>Registering Profile...</span>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="auth-footer">
            <p>
              Already registered?{' '}
              <Link to="/login" className="gov-link-bold">
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
