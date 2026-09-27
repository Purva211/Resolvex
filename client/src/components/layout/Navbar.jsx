import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Menu, Search, Plus } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/complaints?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/complaints');
    }
  }

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <button 
          className="mobile-menu-btn" 
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <form className="search-form" onSubmit={handleSearchSubmit}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search complaint ID, title, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </form>
      </div>

      <div className="navbar-right">
        {user?.role === 'customer' && (
          <button
            onClick={() => navigate('/complaints/new')}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Complaint</span>
          </button>
        )}

        <NotificationBell />

        <div className="navbar-profile">
          <div className="avatar-circle">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="profile-text hidden md:block">
            <span className="profile-name">{user?.name}</span>
            <span className="profile-role">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
