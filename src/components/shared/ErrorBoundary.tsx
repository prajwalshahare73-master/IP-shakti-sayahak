import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="gov-container" style={{ padding: '60px 16px' }}>
          <div className="gov-card text-center" style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 24px' }}>
            <div style={{ display: 'inline-flex', padding: '16px', background: '#fde8e8', borderRadius: '50%', color: '#ca3535', marginBottom: '16px' }}>
              <AlertTriangle size={48} />
            </div>
            <h2 style={{ fontSize: '24px', marginBottom: '8px', color: '#0b0c0c' }}>
              Application Render Encountered an Issue
            </h2>
            <p style={{ color: '#505a5f', marginBottom: '24px', lineHeight: '1.6' }}>
              An unexpected display issue occurred in this section. Your case dossiers and stored session data remain safe.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={this.handleReset}
                className="btn btn-primary"
              >
                <RotateCcw size={16} />
                <span>Reload Page</span>
              </button>
              <a href="/" className="btn btn-outline">
                <Home size={16} />
                <span>Return to Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
