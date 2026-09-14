import React from 'react';
import { CheckCircle2, Clock, UserCheck, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';
import { CaseEvent } from '../../store/appStore';

export const CaseTimeline: React.FC<{ events: CaseEvent[]; currentStatus: string }> = ({
  events,
  currentStatus
}) => {
  const getEventIcon = (actor: string, status: string) => {
    if (status === 'REVIEW_COMPLETED') return <CheckCircle2 size={16} className="text-success" />;
    if (actor === 'expert') return <UserCheck size={16} className="text-primary" />;
    if (actor === 'system') return <ShieldCheck size={16} className="text-secondary" />;
    return <FileText size={16} className="text-primary" />;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="case-timeline" role="region" aria-label="Case Event Timeline">
      <h4 className="timeline-heading">Case Lifecycle & Review Progress</h4>
      <div className="timeline-track">
        {events.map((event, idx) => {
          const isLast = idx === events.length - 1;
          return (
            <div key={event.id || idx} className={`timeline-node ${isLast ? 'active-node' : 'completed-node'}`}>
              <div className="timeline-marker">
                <span className="marker-dot">{getEventIcon(event.actor, event.status)}</span>
                {!isLast && <div className="marker-line" />}
              </div>
              <div className="timeline-content">
                <div className="timeline-meta-row">
                  <span className="timeline-title">{event.title}</span>
                  <span className="timeline-time">{formatDate(event.timestamp)}</span>
                </div>
                <p className="timeline-desc">{event.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
