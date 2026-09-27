import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  CheckSquare, 
  ShieldAlert, 
  Users, 
  ShieldCheck, 
  LogOut,
  Sparkles,
  Headphones
} from 'lucide-react';
import Logo from '../common/Logo';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const role = user.role || 'customer';

  const customerNav = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Complaints', path: '/complaints', icon: FileText },
    { label: 'New Complaint', path: '/complaints/new', icon: PlusCircle, highlight: true }
  ];

  const agentNav = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Assigned Complaints', path: '/complaints', icon: FileText }
  ];

  const adminNav = [
    { label: 'Analytics Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'All Complaints', path: '/complaints', icon: FileText }
  ];

  const navItems = role === 'admin' ? adminNav : role === 'agent' ? agentNav : customerNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onClose} 
          aria-hidden="true" 
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand-box">
          <Logo size="md" />
          <span className="role-tag">{role}</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''} ${item.highlight ? 'highlight-link' : ''}`
                }
                end={item.path === '/dashboard'}
              >
                <Icon size={18} className="sidebar-link-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-ai-teaser">
          <div className="teaser-head">
            <Sparkles size={16} className="text-indigo-400" />
            <span>AI Assistant Active</span>
          </div>
          <p className="teaser-text">Automated complaint classification & SLA engine</p>
        </div>

        <div className="sidebar-user-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="logout-btn" 
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
