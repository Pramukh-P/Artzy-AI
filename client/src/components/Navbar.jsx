import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getInitial } from '../utils';
import Logo from '../assets/Logo2.png';

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-gray-200/60 dark:border-gray-700/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-14 h-14 rounded-xl bg-transparent flex items-center justify-center">
            <img
              src={Logo}
              alt="Artzy Bot"
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'contain',
                borderRadius: '50%',
              }}
            />
          </div>
          <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Artzy<span className="text-[#6469ff]">-AI</span>
          </span>
        </Link>

        {/* Desktop right side */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to="/create-post"
                className="btn-primary text-sm px-5 py-2 flex items-center gap-2"
              >
                <span>✨</span> Generate
              </Link>

              {/* User avatar menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6469ff] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-sm shadow-lg hover:shadow-xl transition-shadow ring-2 ring-white dark:ring-gray-800"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitial(user?.name)
                  )}
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 card-base rounded-2xl shadow-xl py-2 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <Link to="/create-post" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <span>✨</span> Generate Image
                    </Link>
                    <Link to="/my-creations" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <span>🖼️</span> My Creations
                    </Link>
                    <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-sm px-5 py-2">Login</Link>
              <Link to="/signup" className="btn-primary text-sm px-5 py-2">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile right */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden glass border-t border-gray-200/60 dark:border-gray-700/60 animate-fade-in">
          <div className="px-4 py-4 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6469ff] to-[#8b5cf6] flex items-center justify-center text-white font-bold overflow-hidden">
                    {user?.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : getInitial(user?.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <Link to="/create-post" className="flex items-center gap-2 py-2 px-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  ✨ Generate Image
                </Link>
                <Link to="/my-creations" className="flex items-center gap-2 py-2 px-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  🖼️ My Creations
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 py-2 px-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm text-center py-2.5">Login</Link>
                <Link to="/signup" className="btn-primary text-sm text-center py-2.5">Sign Up Free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
