import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Building2,
  LayoutDashboard,
  Map,
  AlertTriangle,
  Calendar,
  Bell,
  Sun,
  Moon,
  Check,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import notificationService from '../../services/notificationService';
import Badge from '../common/Badge';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getNotifications();
      setNotifications(Array.isArray(data) ? data : data?.results || []);
    } catch {
      // silent fail if offline
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications, location.pathname]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // ignore
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await notificationService.markRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
      } catch {
        // ignore
      }
    }
    setNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const roleBadgeVariant = {
    STUDENT: 'student',
    FACULTY: 'faculty',
    ADMIN: 'admin',
  }[user?.role] || 'default';

  const userInitial = (user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase();

  return (
    <nav className="bg-white/95 dark:bg-[#0b1324]/95 backdrop-blur-xl text-slate-800 dark:text-slate-100 shadow-sm border-b border-slate-200/80 dark:border-slate-800/90 sticky top-0 z-50 transition-colors">
      <div className="h-0.5 w-full bg-gradient-to-r from-[#0f1e3d] via-orange-500 to-amber-500" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand (LPU Navy + Orange) */}
          <Link
            to="/"
            className="flex items-center space-x-2.5 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-sm shadow-orange-500/25 group-hover:scale-105 transition-transform">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-extrabold text-lg tracking-tight text-[#0f1e3d] dark:text-white leading-tight">
                CampusXplore
              </span>
              <span className="text-[10px] text-orange-600 dark:text-orange-400 tracking-widest uppercase font-bold">
                LPU Smart Campus
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive('/') ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 font-semibold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Home
                </Link>
                <a href="/#directory" className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Directory
                </a>
                <a href="/#features" className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Features
                </a>
                <a href="/#about" className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  About
                </a>
              </>
            ) : (
              <>
                <Link
                  to="/facilities"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive('/facilities') ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 font-semibold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Facilities</span>
                </Link>
                <Link
                  to="/map"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive('/map') ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 font-semibold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  <span>Map</span>
                </Link>
                <Link
                  to="/bookings"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive('/bookings') ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 font-semibold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Bookings</span>
                </Link>
                <Link
                  to="/reports"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    location.pathname.startsWith('/reports')
                      ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Reports</span>
                </Link>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    location.pathname.includes('/dashboard')
                      ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Portal</span>
                </Link>
              </>
            )}
          </div>

          {/* Right Controls: Theme + Notifications + User */}
          <div className="flex items-center space-x-2">
            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              className="p-2 min-w-[40px] min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications Bell (Authenticated) */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifOpen((prev) => !prev)}
                  aria-label="Notifications"
                  className="relative p-2 min-w-[40px] min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 text-left">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.length === 0 ? (
                        <p className="p-5 text-center text-xs text-slate-500 dark:text-slate-400">
                          You&apos;re all caught up!
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => handleNotifClick(n)}
                            className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer ${
                              !n.is_read ? 'bg-orange-50/50 dark:bg-orange-950/20' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {n.title}
                              </span>
                              {!n.is_read && <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Desktop User Section */}
            <div className="hidden md:flex items-center space-x-2.5">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-full pl-1.5 pr-3 py-1">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0f1e3d] to-slate-700 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                      {userInitial}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[110px] truncate">
                      {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email}
                    </span>
                    <Badge variant={roleBadgeVariant} size="xs">
                      {user?.role}
                    </Badge>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-700 border border-slate-200 dark:border-slate-700 hover:border-rose-200 transition-all cursor-pointer shadow-xs min-h-[36px]"
                    title="Sign out of your session"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-500/20 transition-all active:scale-[0.98]"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 min-w-[44px] min-h-[44px] rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden cursor-pointer flex items-center justify-center"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <div className="space-y-1">
            {!isAuthenticated ? (
              <>
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Home</Link>
                <a href="/#directory" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Directory</a>
                <a href="/#features" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Features</a>
              </>
            ) : (
              <>
                <Link to="/facilities" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Facilities Directory</Link>
                <Link to="/map" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Campus Map</Link>
                <Link to="/bookings" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Venue Bookings</Link>
                <Link to="/reports" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Reports</Link>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">My Portal</Link>
              </>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {user?.email}
                    </span>
                  </div>
                  <Badge variant={roleBadgeVariant} size="xs">
                    {user?.role}
                  </Badge>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-100 text-slate-800 hover:bg-slate-200">Log In</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-xs">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
