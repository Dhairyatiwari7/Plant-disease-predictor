import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('token');

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 w-full z-50 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline h-20">
      <div className="max-w-container-max mx-auto px-lg flex justify-between items-center h-full">
        <div className="flex items-center gap-base">
          <span className="material-symbols-outlined text-primary text-3xl">potted_plant</span>
          <Link to="/" className="text-title-md font-title-md font-bold text-primary dark:text-primary-fixed-dim hover:opacity-80 transition-opacity">
            AgroLens
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-xl">
          <Link
            to="/"
            className={`font-label-md text-label-md transition-colors ${
              isActive('/') ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/predict"
            className={`font-label-md text-label-md transition-colors ${
              isActive('/predict') ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Predict
          </Link>
          <Link
            to="/history"
            className={`font-label-md text-label-md transition-colors ${
              isActive('/history') ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            History
          </Link>
          <Link
            to="/about"
            className={`font-label-md text-label-md transition-colors ${
              isActive('/about') ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            About
          </Link>
        </nav>

        <div className="flex items-center gap-md">
          {isLoggedIn ? (
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-xs text-on-surface-variant hover:bg-primary/5 p-xs rounded-lg transition-all"
            >
              <span className="material-symbols-outlined">account_circle</span>
              <span className="font-label-md text-label-md hidden sm:block">Profile</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-xs text-primary hover:bg-primary/5 p-xs rounded-lg transition-all font-bold"
            >
              <span className="material-symbols-outlined">login</span>
              <span className="font-label-md text-label-md hidden sm:block">Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export const Footer = () => {
  return (
    <footer className="w-full py-xl px-lg mt-auto flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto gap-md bg-surface-container-low dark:bg-surface-container-lowest border-t border-outline-variant dark:border-outline">
      <div className="flex flex-col items-center md:items-start gap-xs">
        <span className="text-label-md font-bold text-on-surface">AgroLens</span>
        <p className="text-body-md font-body-md text-on-surface-variant">© 2024 AgroLens Diagnostic Systems. All rights reserved.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-lg">
        <Link to="/privacy" className="text-on-surface-variant hover:text-primary hover:underline decoration-primary font-label-md text-label-md">Privacy Policy</Link>
        <Link to="/terms" className="text-on-surface-variant hover:text-primary hover:underline decoration-primary font-label-md text-label-md">Terms of Service</Link>
        <Link to="/support" className="text-on-surface-variant hover:text-primary hover:underline decoration-primary font-label-md text-label-md">Contact Support</Link>
        <a href="https://github.com/" target="_blank" rel="noreferrer" className="text-on-surface-variant hover:text-primary hover:underline decoration-primary font-label-md text-label-md">GitHub Repository</a>
      </div>
    </footer>
  );
};
