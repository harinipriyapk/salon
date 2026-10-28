import { useState, useEffect } from 'react';
import { Scissors, Menu, X, ArrowRight, User, Shield, LogOut, Calendar, Globe, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import React from 'react';
export default function Navbar({ onOpenAuth, onOpenUserDashboard, onOpenAdminDashboard }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { lang, changeLanguage, t } = useLanguage();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll for admin messages dispatched to the customer
  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      const checkMessages = async () => {
        try {
          const res = await api.getBookings();
          if (res.success && res.bookings) {
            let totalUnread = 0;
            res.bookings.forEach(b => {
              if (b.adminMessages) {
                totalUnread += b.adminMessages.filter(m => !m.readByClient).length;
              }
            });
            setUnreadCount(totalUnread);
          }
        } catch (e) {}
      };
      checkMessages();
      const interval = setInterval(checkMessages, 5000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated, isAdmin]);

  const closeMenu = () => setMobileMenu(false);

  return (
    <>
      <div className="announcement">
        {t('announcement')}
      </div>

      <header className="site-header">
        <a className="brand" href="#home" onClick={closeMenu}>
          <span className="brand-mark"><Scissors size={19} /></span>
          <span>
            {t('parlourTitle')}
            <small>{t('parlourSub')}</small>
          </span>
        </a>

        {/* Language Switcher Button (English / தமிழ்) */}
        <div className="header-right-cluster">
          <button
            type="button"
            className="lang-toggle-btn"
            onClick={() => changeLanguage(lang === 'en' ? 'ta' : 'en')}
            title="Switch Language / மொழியை மாற்றவும்"
          >
            <Globe size={13} />
            <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          <button
            className="menu-toggle"
            aria-label="Toggle navigation"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>

        <nav className={mobileMenu ? 'nav-links open' : 'nav-links'}>
          <a href="#services" onClick={closeMenu}>{t('menu')}</a>
          <a href="#story" onClick={closeMenu}>{t('ourParlour')}</a>
          <a href="#reviews" onClick={closeMenu}>{t('kindWords')}</a>

          {/* User / Admin Authentication & Portals */}
          {isAuthenticated ? (
            <div className="nav-user-cluster">
              {isAdmin ? (
                <button
                  type="button"
                  className="button-admin-portal"
                  onClick={() => { closeMenu(); onOpenAdminDashboard(); }}
                >
                  <Shield size={14} />
                  <span>{t('adminDashboard')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="button-user-portal"
                  onClick={() => { closeMenu(); onOpenUserDashboard(); }}
                >
                  <Calendar size={14} />
                  <span>{t('myReservations')}</span>
                  {unreadCount > 0 && (
                    <span className="navbar-unread-badge" title="New message from salon admin">
                      💬 {unreadCount}
                    </span>
                  )}
                </button>
              )}

              <div className="user-greeting">
                <span className="user-avatar-tag">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
                <span className="user-name-display">{user.name.split(' ')[0]}</span>
              </div>

              <button
                type="button"
                className="button-logout"
                onClick={() => { closeMenu(); logout(); }}
                title={t('signOut')}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="button-auth-trigger"
              onClick={() => { closeMenu(); onOpenAuth(); }}
            >
              <User size={14} />
              <span>{t('signInDemo')}</span>
            </button>
          )}

          <a className="nav-book" href="#booking" onClick={closeMenu}>
            {t('bookAChair')} <ArrowRight size={15} />
          </a>
        </nav>
      </header>
    </>
  );
}
