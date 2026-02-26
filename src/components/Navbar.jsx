import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        ✨ FluentAI
      </Link>
      <nav className="navbar-links">
        <NavLink to="/" end>
          Home
        </NavLink>
        {user && (
          <>
            <NavLink to="/articles/new">Create</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </>
        )}
      </nav>
      <div className="navbar-auth">
        {user ? (
          <>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '500' }}>
              {user.name || user.email}
            </span>
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-auth-link">
              Sign In
            </Link>
            <Link to="/signup" className="navbar-auth-link">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

