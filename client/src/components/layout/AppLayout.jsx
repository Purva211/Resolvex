import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      <div className="app-main-wrapper">
        <Navbar 
          onToggleSidebar={() => setSidebarOpen((v) => !v)} 
        />
        <main className="app-content-container">
          {children}
        </main>
      </div>
    </div>
  );
}
