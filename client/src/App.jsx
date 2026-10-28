import { useState, useEffect } from 'react';
import {
  ArrowDown, ArrowRight, Clock3, Instagram, MapPin,
  Scissors, MessageSquare
} from 'lucide-react';
import { api } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import BookingSection from './components/BookingSection';
import ReviewsSection from './components/ReviewsSection';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import EntrySplash from './components/EntrySplash';
import React from 'react';
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function MainContent() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { lang, t } = useLanguage();

  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [showSplash, setShowSplash] = useState(true);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [userDashboardOpen, setUserDashboardOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);

  // Fetch active services
  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await api.getServices();
        if (res.success && res.services?.length) {
          setServices(res.services);
        }
      } catch (err) {
        console.warn('Could not load services:', err.message);
      }
    }
    fetchServices();
  }, []);

  const openAuth = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleSelectServiceFromCard = (serviceId) => {
    setSelectedServiceId(serviceId);
    const bookingEl = document.getElementById('booking');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="site-shell">
      {/* Animated Entry Splash Screen Overlay */}
      {showSplash && (
        <EntrySplash
          onFinish={() => setShowSplash(false)}
        />
      )}

      <Navbar
        onOpenAuth={() => openAuth('login')}
        onOpenUserDashboard={() => setUserDashboardOpen(true)}
        onOpenAdminDashboard={() => setAdminDashboardOpen(true)}
      />

      <main>
        {/* Hero Section */}
        <section id="home" className="hero">
          <div className="hero-copy">
            <p className="eyebrow"><span /> {t('heroEyebrow')} <span /></p>
            <h1>{t('heroTitle1')}<br /><em>{t('heroTitle2')}</em></h1>
            <p className="hero-description">
              {t('heroDesc')}
            </p>
            <div className="hero-actions">
              <a className="button button-dark" href="#booking">{t('reserveVisit')} <ArrowRight size={16} /></a>
              <a className="text-link" href="#services">{t('exploreMenu')} <ArrowDown size={15} /></a>
            </div>
            <div className="hero-note">
              <div className="avatar-stack"><span>V</span><span>&</span><span>V</span></div>
              <p><strong>{t('heroNoteTitle')}</strong><br />{t('heroNoteSub')}</p>
            </div>
          </div>
          <div className="hero-image-wrap">
            <img
              className="hero-image"
              src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=88"
              alt="Warm, welcoming vintage-inspired hair salon"
            />
            <div className="image-stamp"><span>✳</span><small>MAKE YOURSELF<br />AT HOME</small></div>
            <div className="hero-caption"><span>01 / 03</span><span>THE PARLOUR, ON A SLOW AFTERNOON</span></div>
          </div>
        </section>

        {/* Trust Strip */}
        <section className="trust-strip">
          <div><Scissors /><p><strong>{t('trust1Title')}</strong><span>{t('trust1Sub')}</span></p></div>
          <div><Clock3 /><p><strong>{t('trust2Title')}</strong><span>{t('trust2Sub')}</span></p></div>
          <div><MessageSquare /><p><strong>{t('trust3Title')}</strong><span>{t('trust3Sub')}</span></p></div>
          <div><MapPin /><p><strong>{t('trust4Title')}</strong><span>{t('trust4Sub')}</span></p></div>
        </section>

        {/* Service Menu */}
        <section id="services" className="section services-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t('servicesEyebrow')}</p>
              <h2>{t('servicesTitle')} <em>{t('servicesTitleEm')}</em></h2>
            </div>
            <p>{t('servicesDesc')}</p>
          </div>

          <div className="service-grid">
            {services.map((service, index) => (
              <article className="service-card" key={service._id}>
                <div className="service-card-top">
                  <span className="service-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="service-category">{service.category}</span>
                </div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className="service-meta">
                  <span><Clock3 size={14} /> {service.durationMinutes} min</span>
                  <strong>{money.format(service.price)}</strong>
                </div>
                <button
                  type="button"
                  className="service-book-btn"
                  onClick={() => handleSelectServiceFromCard(service._id)}
                >
                  {t('chooseService')} <ArrowRight size={15} />
                </button>
              </article>
            ))}
          </div>
          <p className="service-footnote">{t('serviceFootnote')}</p>
        </section>

        {/* Parlour Story */}
        <section id="story" className="story-section">
          <div className="story-image">
            <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1300&q=85" alt="Stylist caring for a client's hair" />
            <span>THE GOOD OLD DAYS, EVERY DAY</span>
          </div>
          <div className="story-copy">
            <p className="eyebrow">{t('storyEyebrow')}</p>
            <h2>{t('storyTitle1')}<br /><em>{t('storyTitle2')}</em></h2>
            <p>{t('storyP1')}</p>
            <p>{t('storyP2')}</p>
            <div className="signature">
              {t('storySign1')}<br />
              <strong>{t('storySign2')}</strong>
            </div>
          </div>
        </section>

        {/* Core Feature 1: Reservation Form with Live Slot Availability & WhatsApp Notifications */}
        <BookingSection
          services={services}
          selectedInitialServiceId={selectedServiceId}
          onBookingSuccess={() => {}}
        />

        {/* Core Feature 2: Verified Feedback Section with Strict Validation */}
        <ReviewsSection openAuthModal={openAuth} />
      </main>

      {/* Parlour Footer */}
      <footer className="site-footer">
        <div className="footer-main">
          <div>
            <a className="brand footer-brand" href="#home">
              <span className="brand-mark"><Scissors size={19} /></span>
              <span>{t('parlourTitle')}<small>{t('parlourSub')}</small></span>
            </a>
            <p>A good haircut and a little kindness<br />never go out of style.</p>
          </div>
          <div className="footer-detail">
            <strong>Find us</strong>
            <span>14 Rosewood Lane</span>
            <span>hello@velvetandvine.example</span>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <Instagram size={17} /> @velvetandvine
            </a>
          </div>
          <div className="footer-detail">
            <strong>Salon Hours</strong>
            <span>Tuesday – Saturday</span>
            <span>9:00 am – 5:00 pm</span>
            <a href="#booking">{t('bookAChair')} <ArrowRight size={14} /></a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Velvet & Vine Hair Parlour</span>
          <span>Made with care, and a little setting lotion. Full-stack MERN Application.</span>
        </div>
      </footer>

      {/* Modals & Dashboards */}
      <AuthModal
        isOpen={authModalOpen}
        initialTab={authModalTab}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={() => {}}
      />

      <UserDashboard
        isOpen={userDashboardOpen}
        onClose={() => setUserDashboardOpen(false)}
        services={services}
      />

      <AdminDashboard
        isOpen={adminDashboardOpen}
        onClose={() => setAdminDashboardOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
