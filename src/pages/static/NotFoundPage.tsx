import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, Search, Sparkles, ArrowLeft } from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="gov-404-page" id="main-content">
      <Breadcrumbs customTrail={[{ title: '404 Page Not Found', link: '#' }]} />

      <div className="gov-container">
        <div className="gov-card not-found-card text-center">
          <div className="not-found-icon-wrap">
            <ShieldAlert size={64} className="text-warning" />
          </div>

          <span className="status-badge warning mb-3">HTTP 404 — Record Not Found</span>
          <h1 className="not-found-title">Page or Dossier Not Located</h1>
          <p className="not-found-desc">
            The page, case file, or regulatory reference you requested does not exist or may have been relocated.
          </p>

          <div className="not-found-actions">
            <button onClick={() => navigate(-1)} className="btn btn-outline">
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </button>
            <Link to="/" className="btn btn-primary">
              <Home size={16} />
              <span>Return to Portal Home</span>
            </Link>
            <Link to="/ask" className="btn btn-secondary">
              <Sparkles size={16} />
              <span>Ask IP Question</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
