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
        FluentAI
      </Link>
      <nav className="navbar-links">
        <NavLink to="/" end>
          Home
        </NavLink>
        {user && (
          <>
            <NavLink to="/articles/new">New Article</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </>
        )}
      </nav>
      <div className="navbar-auth">
        {user ? (
          <>
            <span className="navbar-user">{user.name || user.email}</span>
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/signup">Sign up</NavLink>
          </>
        )}
      </div>
    </header>
  );
}

