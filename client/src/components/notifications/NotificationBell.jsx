import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, Clock, ShieldAlert, FileText } from 'lucide-react';
import api from '../../services/api';

export default function NotificationBell() {
  const [data, setData] = useState({ items: [], unread: 0 });
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  async function load() {
    try {
      const r = await api.get('/notifications');
      setData(r.data);
    } catch (e) {
      // Keep silent on background load failures
    }
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const closeOnClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', closeOnClickOutside);
    return () => document.removeEventListener('mousedown', closeOnClickOutside);
  }, []);

  async function markRead(id, e) {
    if (e) e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      await load();
    } catch {}
  }

  async function readAll() {
    try {
      await api.patch('/notifications/read-all');
      await load();
    } catch {}
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'COMPLAINT_CREATED':
        return <FileText size={16} className="text-blue-500" />;
      case 'COMPLAINT_ASSIGNED':
        return <Clock size={16} className="text-purple-500" />;
      case 'COMPLAINT_RESOLVED':
        return <CheckCircleIcon />;
      case 'SLA_BREACHED':
        return <ShieldAlert size={16} className="text-rose-500" />;
      default:
        return <Bell size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="notification-wrap" ref={ref}>
      <button 
        className={`btn-icon ${data.unread > 0 ? 'has-unread' : ''}`} 
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {data.unread > 0 && (
          <span className="notification-badge font-bold">
            {data.unread > 99 ? '99+' : data.unread}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 text-sm">Notifications</span>
              {data.unread > 0 && (
                <span className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 rounded-full font-medium">
                  {data.unread} new
                </span>
              )}
            </div>
            {data.unread > 0 && (
              <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1" onClick={readAll}>
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          <div className="dropdown-body">
            {data.items.length ? (
              data.items.slice(0, 10).map((n) => {
                const complaintId = n.complaint?._id || (typeof n.complaint === 'string' ? n.complaint : null);
                return (
                  <div 
                    key={n._id} 
                    className={`notification-card ${n.isRead ? 'read' : 'unread'}`}
                  >
                    <div className="notification-icon-box">
                      {getNotificationIcon(n.type)}
                    </div>
                    <div className="notification-content">
                      {complaintId ? (
                        <Link 
                          to={`/complaints/${complaintId}`} 
                          onClick={() => {
                            if (!n.isRead) markRead(n._id);
                            setOpen(false);
                          }}
                          className="notification-link"
                        >
                          <span className="notification-title">{n.title}</span>
                          <span className="notification-message">{n.message}</span>
                        </Link>
                      ) : (
                        <div>
                          <span className="notification-title">{n.title}</span>
                          <span className="notification-message">{n.message}</span>
                        </div>
                      )}
                      <span className="notification-time">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {!n.isRead && (
                      <button 
                        className="mark-read-btn" 
                        onClick={(e) => markRead(n._id, e)}
                        title="Mark as read"
                      >
                        <Check size={13} />
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="dropdown-empty">
                <Bell size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
