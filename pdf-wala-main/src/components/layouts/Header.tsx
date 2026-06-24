import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, User as UserIcon, CreditCard, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { Button } from '../common/Button';
import { cn } from '../../utils/helpers';
import { useAuth } from '../../hooks';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { user, logout, isAuthenticated } = useAuth();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Tools', path: '/tools' },
    
    { label: 'Blog', path: '/blog' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Donate', path: '/donate' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location]);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold gradient-text font-display"
            >
              PDF Wala
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm',
                  isActive(item.path)
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-350'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Authentication Section (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated && user ? (
                /* Profile Dropdown */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-700 dark:text-gray-200 font-medium transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 text-white flex items-center justify-center font-bold shadow-md">
                      {userInitial}
                    </div>
                    <span className="max-w-[100px] truncate text-sm">{user.name}</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", dropdownOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-dark-800 border border-gray-250 dark:border-dark-700 shadow-xl py-2 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-dark-700">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                          <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300 capitalize">
                            {user.subscription} Plan
                          </div>
                        </div>


                        <div className="border-t border-gray-100 dark:border-dark-700 pt-1">
                          <button
                            onClick={() => {
                              logout();
                              setDropdownOpen(false);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-405 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            Log Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                null
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-800 dark:text-white transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-6 border-t border-gray-100 dark:border-dark-800/50 mt-1 pt-4 space-y-2 overflow-hidden"
            >
              {/* User Profile Info in Mobile drawer */}
              {isAuthenticated && user && (
                <div className="px-4 py-3 mb-4 rounded-xl bg-gray-50 dark:bg-dark-850/50 border border-gray-100 dark:border-dark-800/40 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 text-white flex items-center justify-center font-bold shadow-sm">
                    {userInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-3xs font-medium bg-primary-100 text-primary-805 dark:bg-primary-900/40 dark:text-primary-300 capitalize">
                      {user.subscription} Plan
                    </span>
                  </div>
                </div>
              )}

              {/* Standard Nav Items */}
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'block px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-base',
                      isActive(item.path)
                        ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Auth actions for Mobile */}
              <div className="pt-4 border-t border-gray-150 dark:border-dark-800/60 mt-4 space-y-2 px-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-red-650 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 font-semibold border border-red-200/50 dark:border-red-900/20 transition-all duration-205"
                  >
                    <LogOut className="w-5 h-5" />
                    Log Out
                  </button>
                ) : (
                  null
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

