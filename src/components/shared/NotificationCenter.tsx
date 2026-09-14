import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  ShieldAlert,
  Clock,
  UserCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { useAppStore, AppNotification } from '../../store/appStore';

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const { notifications, markNotificationRead } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.read) markNotificationRead(n.id);
    });
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} className="text-success" />;
      case 'review':
        return <UserCheck size={16} className="text-primary" />;
      case 'warning':
        return <ShieldAlert size={16} className="text-accent" />;
      default:
        return <Clock size={16} className="text-secondary" />;
    }
  };

  return (
    <div className={`notification-center-wrapper ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn-icon notif-bell-btn"
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="notif-badge-counter">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="gov-dropdown-menu notif-menu show" role="dialog" aria-label="Notifications">
          <div className="notif-menu-header">
            <div className="notif-title-group">
              <strong>Notifications & Updates</strong>
              {unreadCount > 0 && <span className="unread-tag">{unreadCount} new</span>}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="mark-read-btn"
                title="Mark all as read"
              >
                <CheckCheck size={14} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="notif-list-body">
            {notifications.length === 0 ? (
              <div className="empty-notifs">
                <Bell size={28} className="text-muted" />
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notif-item ${notif.read ? 'read' : 'unread'}`}
                  onClick={() => markNotificationRead(notif.id)}
                >
                  <div className="notif-item-icon">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="notif-item-content">
                    <div className="notif-item-title-row">
                      <h4 className="notif-item-title">{notif.title}</h4>
                      <span className="notif-item-time">{notif.timestamp}</span>
                    </div>
                    <p className="notif-item-msg">{notif.message}</p>
                    {notif.caseId && (
                      <Link
                        to={`/dashboard?case=${notif.caseId}`}
                        className="notif-case-link"
                        onClick={() => setIsOpen(false)}
                      >
                        <span>View Dossier {notif.caseId}</span>
                        <ExternalLink size={11} />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="notif-menu-footer">
            <Link
              to="/dashboard"
              className="view-all-link"
              onClick={() => setIsOpen(false)}
            >
              Go to Citizen Dashboard →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
