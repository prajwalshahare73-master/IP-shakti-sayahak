import React from 'react';
import { Clock, CheckCircle2, UserCheck, AlertCircle, HelpCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'SUBMITTED' | 'ASSIGNED' | 'IN_REVIEW' | 'NEED_MORE_INFORMATION' | 'REVIEW_COMPLETED' | 'CLOSED' | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'SUBMITTED':
        return {
          label: 'Submitted',
          className: 'status-badge info',
          icon: <Clock size={12} />
        };
      case 'ASSIGNED':
        return {
          label: 'Expert Assigned',
          className: 'status-badge warning',
          icon: <UserCheck size={12} />
        };
      case 'IN_REVIEW':
        return {
          label: 'In Review',
          className: 'status-badge warning',
          icon: <Clock size={12} />
        };
      case 'NEED_MORE_INFORMATION':
        return {
          label: 'Action Required',
          className: 'status-badge error',
          icon: <AlertCircle size={12} />
        };
      case 'REVIEW_COMPLETED':
        return {
          label: 'Review Completed',
          className: 'status-badge success',
          icon: <CheckCircle2 size={12} />
        };
      case 'CLOSED':
        return {
          label: 'Closed',
          className: 'status-badge neutral',
          icon: <XCircle size={12} />
        };
      default:
        return {
          label: status,
          className: 'status-badge neutral',
          icon: <HelpCircle size={12} />
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`${config.className} ${size === 'sm' ? 'status-badge-sm' : ''}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
