import React from 'react';
import Navbar from '../components/Navbar.jsx';

export default function MainLayout({ children }) {
  return (
    <div className="app-root">
      <Navbar />
      <main className="app-main">{children}</main>
    </div>
  );
}

