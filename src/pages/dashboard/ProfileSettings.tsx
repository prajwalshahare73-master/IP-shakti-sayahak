import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Building,
  MapPin,
  Globe,
  Bell,
  Save,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { useAppStore } from '../../store/appStore';
import { SUPPORTED_LANGUAGES } from '../../i18n/config';
import { supabase, isSupabaseConfigured } from '../../services/supabase';

export const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser, setSession, language, setLanguage, responseLanguage, setResponseLanguage } = useAppStore();

  const [formData, setFormData] = useState({
    name: user?.name || 'Prajwal Vaidya',
    email: user?.email || 'prajwal.ayur@gmail.com',
    phone: '+91 98234 56789',
    organization: 'Shree Ayurveda Research Foundation',
    state: 'Maharashtra',
    notifyEmail: true,
    notifySms: true
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      setUser({
        ...user,
        name: formData.name,
        email: formData.email
      });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error:', err);
      }
    }
    setUser(null);
    setSession(null);
    navigate('/login');
  };

  return (
    <div className="gov-settings-page" id="main-content">
      <Breadcrumbs
        customTrail={[
          { title: 'Citizen Dashboard', link: '/dashboard' },
          { title: 'Account & Preferences', link: '/dashboard/settings' }
        ]}
      />

      <div className="gov-container settings-container">
        <div className="settings-header-row">
          <div>
            <Link to="/dashboard" className="gov-back-link">
              <ChevronLeft size={16} />
              <span>Back to Cases Dashboard</span>
            </Link>
            <h1 className="settings-page-title">Profile & Regulatory Preferences</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-outline btn-sm text-error"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="gov-card success-banner-pill" role="alert">
            <CheckCircle2 size={18} className="text-success" />
            <span>Profile and notification preferences updated successfully.</span>
          </div>
        )}

        <div className="settings-grid">
          {/* Main Settings Form */}
          <div className="settings-main-col">
            <form onSubmit={handleSubmit} className="gov-card settings-card">
              <h2 className="card-section-title">Innovator Identity</h2>

              <div className="gov-form-group">
                <label htmlFor="settings-name" className="gov-label">
                  Full Name / Practitioner Name
                </label>
                <div className="input-with-icon">
                  <User size={17} className="field-icon" />
                  <input
                    id="settings-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="gov-input"
                    required
                  />
                </div>
              </div>

              <div className="gov-form-group">
                <label htmlFor="settings-email" className="gov-label">
                  Official Email Address
                </label>
                <div className="input-with-icon">
                  <Mail size={17} className="field-icon" />
                  <input
                    id="settings-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="gov-input"
                    required
                  />
                </div>
              </div>

              <div className="gov-form-group">
                <label htmlFor="settings-org" className="gov-label">
                  Ayurvedic Institute / MSME Enterprise
                </label>
                <div className="input-with-icon">
                  <Building size={17} className="field-icon" />
                  <input
                    id="settings-org"
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="gov-input"
                  />
                </div>
              </div>

              <div className="gov-form-group">
                <label htmlFor="settings-state" className="gov-label">
                  Primary State Biodiversity Board Jurisdiction
                </label>
                <div className="input-with-icon">
                  <MapPin size={17} className="field-icon" />
                  <select
                    id="settings-state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="gov-input gov-select"
                  >
                    <option value="Maharashtra">Maharashtra (MSBB)</option>
                    <option value="Kerala">Kerala (KSBB)</option>
                    <option value="Gujarat">Gujarat (GSBB)</option>
                    <option value="Karnataka">Karnataka (KSBB)</option>
                    <option value="Uttarakhand">Uttarakhand (UKSBB)</option>
                    <option value="Himachal Pradesh">Himachal Pradesh (HPSBB)</option>
                  </select>
                </div>
              </div>

              <hr className="divider" />

              <h2 className="card-section-title">Language Preferences</h2>

              <div className="settings-lang-row">
                <div className="gov-form-group half-width">
                  <label htmlFor="settings-ui-lang" className="gov-label">
                    Interface Language
                  </label>
                  <select
                    id="settings-ui-lang"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="gov-input gov-select font-devanagari"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.nativeName} ({l.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="gov-form-group half-width">
                  <label htmlFor="settings-resp-lang" className="gov-label">
                    AI Guidance Language
                  </label>
                  <select
                    id="settings-resp-lang"
                    value={responseLanguage}
                    onChange={(e) => setResponseLanguage(e.target.value)}
                    className="gov-input gov-select font-devanagari"
                  >
                    <option value="en">English (Statutory Standard)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="hinglish">Hinglish (Colloquial mix)</option>
                    <option value="sa">संस्कृतम् (Sanskrit)</option>
                    <option value="gu">ગુજરાતી (Gujarati)</option>
                  </select>
                </div>
              </div>

              <hr className="divider" />

              <h2 className="card-section-title">Case Notification Alerts</h2>

              <div className="checkbox-stack">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.notifyEmail}
                    onChange={(e) => setFormData({ ...formData, notifyEmail: e.target.checked })}
                  />
                  <span>Email notifications when an Empanelled Expert reviews my case</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.notifySms}
                    onChange={(e) => setFormData({ ...formData, notifySms: e.target.checked })}
                  />
                  <span>SMS alert for urgent Section 3(p) or ABS filing deadlines</span>
                </label>
              </div>

              <div className="form-submit-row">
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  <span>Save Preferences</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Summary Card */}
          <div className="settings-side-col">
            <div className="gov-card">
              <div className="security-notice-header">
                <ShieldCheck size={24} className="text-secondary" />
                <h3>Ayur-IP Privacy Protocol</h3>
              </div>
              <p className="security-text">
                Your formulation details and ingredients are encrypted at rest. Classical text cross-references (TKDL) are executed locally or via private sovereign instances.
              </p>
              <div className="meta-box mt-3">
                <span className="text-muted">Account Tier:</span>
                <strong>Registered Ayush Innovator</strong>
              </div>
              <div className="meta-box">
                <span className="text-muted">Role:</span>
                <span className="status-badge success">{user?.role || 'Citizen'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
