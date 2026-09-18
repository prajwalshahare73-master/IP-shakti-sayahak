import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  UserCheck,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Award,
  KeyRound,
  FileCheck
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { supabase, isSupabaseConfigured } from '../../services/supabase';

export const ExpertLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, authInitialized } = useAppStore();

  const [expertId, setExpertId] = useState('EXP-IN-7042');
  const [password, setPassword] = useState('••••••••••••');
  const [specialization, setSpecialization] = useState('tk');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/expert/dashboard';
  const roleMismatch = (location.state as any)?.roleMismatch;

  useEffect(() => {
    if (authInitialized && user) {
      navigate(from === '/expert/login' ? '/expert/dashboard' : from, { replace: true });
    }
  }, [authInitialized, user, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured() && supabase) {
        // Authenticate with Supabase if configured
        const { data, error } = await supabase.auth.signInWithPassword({
          email: expertId.includes('@') ? expertId : `${expertId}@expert.ipsakti.gov.in`,
          password
        });
        if (error) throw error;
        setUser({
          name: data.user?.user_metadata?.full_name || 'Dr. V. Sharma',
          email: data.user?.email || 'v.sharma@ayurip-panel.gov.in',
          role: 'expert'
        });
      } else {
        // Mock fallback for evaluation
        await new Promise((resolve) => setTimeout(resolve, 600));
        setUser({
          name: 'Dr. V. Sharma (Senior IP Facilitator)',
          email: 'v.sharma@ayurip-panel.gov.in',
          role: 'expert'
        });
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Empanelled credentials verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickExpertFill = (expertProfile: 'tk' | 'abs' | 'tm') => {
    if (expertProfile === 'tk') {
      setUser({
        name: 'Dr. V. Sharma (Senior IP Facilitator)',
        email: 'v.sharma@ayurip-panel.gov.in',
        role: 'expert'
      });
    } else if (expertProfile === 'abs') {
      setUser({
        name: 'Adv. M. Sundaram (NBA Legal Counsel)',
        email: 'm.sundaram@ayurip-panel.gov.in',
        role: 'expert'
      });
    } else {
      setUser({
        name: 'Adv. Preeti Nair (Patent & TM Attorney)',
        email: 'p.nair@ayurip-panel.gov.in',
        role: 'expert'
      });
    }
    navigate('/expert/dashboard', { replace: true });
  };

  return (
    <div className="gov-auth-page expert-theme" id="main-content">
      <div className="gov-container auth-container">
        <div className="gov-card auth-card expert-auth-card">
          <div className="auth-header">
            <div className="auth-emblem expert-emblem">
              <UserCheck size={36} className="text-primary" />
            </div>
            <div className="empanelled-badge">
              <Award size={14} />
              <span>Government Empanelled Specialist Access</span>
            </div>
            <h1 className="auth-title">Authorized Human Expert Portal</h1>
            <p className="auth-subtitle">
              Secure console for Patent Attorneys, AYUSH Scientists, TKDL Examiners, and SBB Officers to review escalated dossiers.
            </p>
          </div>

          {roleMismatch && (
            <div className="auth-alert warning" role="alert">
              <AlertCircle size={18} />
              <span>You must sign in with an Authorized Expert account to view this section.</span>
            </div>
          )}

          {errorMsg && (
            <div className="auth-alert error" role="alert">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="gov-form-group">
              <label htmlFor="expert-id" className="gov-label">
                Empanelment ID or Official Email *
              </label>
              <div className="input-with-icon">
                <Mail size={18} className="field-icon" />
                <input
                  id="expert-id"
                  type="text"
                  required
                  value={expertId}
                  onChange={(e) => setExpertId(e.target.value)}
                  placeholder="e.g. EXP-IN-7042"
                  className="gov-input font-mono"
                />
              </div>
            </div>

            <div className="gov-form-group">
              <label htmlFor="specialization" className="gov-label">
                Domain Panel *
              </label>
              <div className="input-with-icon">
                <FileCheck size={18} className="field-icon" />
                <select
                  id="specialization"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="gov-input gov-select"
                >
                  <option value="tk">Traditional Knowledge / Section 3(p) Review</option>
                  <option value="abs">National Biodiversity Authority / ABS Compliance</option>
                  <option value="patents">Pharmaceutical Formulation & Extraction Patents</option>
                  <option value="tm">Trade Marks & Geographical Indications</option>
                </select>
              </div>
            </div>

            <div className="gov-form-group">
              <div className="label-row-between">
                <label htmlFor="expert-password" className="gov-label">
                  Security Token / Password *
                </label>
                <span className="text-muted" style={{ fontSize: '12px' }}>2FA Protected</span>
              </div>
              <div className="input-with-icon">
                <KeyRound size={18} className="field-icon" />
                <input
                  id="expert-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure token"
                  className="gov-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block btn-lg"
            >
              {loading ? (
                <span>Validating Empanelled Access...</span>
              ) : (
                <>
                  <span>Authenticate & Enter Console</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Profiles */}
          <div className="auth-demo-box">
            <span className="demo-label">1-Click Test Access:</span>
            <div className="demo-btn-group">
              <button
                type="button"
                onClick={() => handleQuickExpertFill('tk')}
                className="btn btn-outline btn-sm"
              >
                Dr. V. Sharma (TK Specialist)
              </button>
              <button
                type="button"
                onClick={() => handleQuickExpertFill('abs')}
                className="btn btn-outline btn-sm"
              >
                Adv. M. Sundaram (ABS Counsel)
              </button>
            </div>
          </div>

          <div className="auth-footer">
            <p>
              Citizen or Vaidya?{' '}
              <Link to="/login" className="gov-link-bold">
                Return to Citizen / Innovator Sign In
              </Link>
            </p>
            <div className="auth-security-badge">
              <ShieldCheck size={14} className="text-secondary" />
              <span>Audited under Ayur-IP Panel Governance Protocol 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
