import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, UserCheck, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';
import { CaseEvent } from '../../store/appStore';

export const CaseTimeline: React.FC<{ events: CaseEvent[]; currentStatus: string }> = ({
  events,
  currentStatus
}) => {
  const { t, i18n } = useTranslation();

  const getEventIcon = (actor: string, status: string) => {
    if (status === 'REVIEW_COMPLETED') return <CheckCircle2 size={16} className="text-success" />;
    if (actor === 'expert') return <UserCheck size={16} className="text-primary" />;
    if (actor === 'system') return <ShieldCheck size={16} className="text-secondary" />;
    return <FileText size={16} className="text-primary" />;
  };

  const getLocalizedEventTitle = (title: string) => {
    if (title.includes('Query Submitted') || title.includes('Case Created')) {
      return t('timeline.evQuerySubmitted', title);
    }
    if (title.includes('AI Statutory') || title.includes('Analysis Generated')) {
      return t('timeline.evAiAnalysis', title);
    }
    if (title.includes('Escalated') || title.includes('Specialist')) {
      return t('timeline.evEscalated', title);
    }
    if (title.includes('Additional Information') || title.includes('User')) {
      return t('timeline.evUserResponse', title);
    }
    if (title.includes('Completed') || title.includes('Approved')) {
      return t('timeline.evReviewCompleted', title);
    }
    return title;
  };

  const getLocalizedEventDesc = (desc: string) => {
    if (desc.includes('initiated') || desc.includes('inquiry')) {
      return t('timeline.evQuerySubmittedDesc', desc);
    }
    if (desc.includes('Section 3(p)') || desc.includes('TK risk flagged')) {
      return t('timeline.evAiAnalysisDesc', desc);
    }
    if (desc.includes('submitted for human expert')) {
      return t('timeline.evEscalatedDesc', desc);
    }
    if (desc.includes('completed statutory assessment')) {
      return t('timeline.evReviewCompletedDesc', desc);
    }
    return desc;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const locale = i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'mr' ? 'mr-IN' : i18n.language === 'gu' ? 'gu-IN' : 'en-IN';
      return d.toLocaleDateString(locale, {
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
      <h4 className="timeline-heading">{t('timeline.heading', 'Case Lifecycle & Review Progress')}</h4>
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
                  <span className="timeline-title">{getLocalizedEventTitle(event.title)}</span>
                  <span className="timeline-time">{formatDate(event.timestamp)}</span>
                </div>
                <p className="timeline-desc">{getLocalizedEventDesc(event.description)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
