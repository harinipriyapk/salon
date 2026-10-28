import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Sparkles, ArrowRight } from 'lucide-react';
import { SALON_STICKER, SALON_STICKER_ALT } from '../config/entrySticker';
import { useLanguage } from '../context/LanguageContext';
import React from 'react';

export default function EntrySplash({ onFinish }) {
  const { lang, t } = useLanguage();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const phrases = lang === 'ta'
    ? [
        'சுவையான பார்லர் தேநீர் தயாராகிறது...',
        'உங்கள் இருக்கை அலங்கரிக்கப்படுகிறது...',
        'சூடான டவல்கள் தயாராகின்றன...',
        'கிடைக்கும் நேரங்கள் சரிபார்க்கப்படுகின்றன...',
        'வெல்வெட் & வைனுக்கு நல்வரவு...',
      ]
    : [
        'Brewing fresh parlour tea...',
        'Preparing your styling chair...',
        'Warming the fresh towels...',
        'Checking slot availability...',
        'Welcome to Velvet & Vine...',
      ];

  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  // Cycle phrases smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 850);
    return () => clearInterval(interval);
  }, [phrases.length]);

  const triggerExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onFinishRef.current) {
        onFinishRef.current();
      }
    }, 500);
  };

  // Guaranteed transition after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerExit();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleManualEnter = () => {
    triggerExit();
  };

  return (
    <div
      className={`entry-splash-screen ${isExiting ? 'is-exiting' : ''}`}
    >
      <div className="entry-splash-grain-overlay" />

      {/* Decorative Vintage Outer Border */}
      <motion.div
        className="entry-parchment-frame"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="frame-corner top-left">✳</div>
        <div className="frame-corner top-right">✳</div>
        <div className="frame-corner bottom-left">✳</div>
        <div className="frame-corner bottom-right">✳</div>

        {/* Central Sticker Container with Fade-in, Rotation, and Pulse */}
        <div className="sticker-medallion-wrap">
          {/* Subtle Rotating Ornate Outer Gold Ring */}
          <motion.div
            className="sticker-gold-halo"
            animate={{
              rotate: 360,
              scale: [1, 1.04, 1],
            }}
            transition={{
              rotate: { repeat: Infinity, duration: 25, ease: 'linear' },
              scale: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
            }}
          />

          {/* Central Salon Sticker with Fade-in, Rotation, and Pulse */}
          <motion.div
            className="sticker-card-motion"
            initial={{ opacity: 0, scale: 0.5, rotate: -25 }}
            animate={{
              opacity: 1,
              scale: [1, 1.05, 1],
              rotate: [-25, 0, 2, -2, 0],
            }}
            transition={{
              opacity: { duration: 0.9, ease: 'easeOut' },
              rotate: { duration: 1.4, ease: 'easeOut' },
              scale: {
                repeat: Infinity,
                duration: 2.2,
                ease: 'easeInOut',
                repeatType: 'mirror',
                delay: 0.5,
              },
            }}
          >
            <div className="sticker-glow" />
            <img
              src={SALON_STICKER}
              alt={SALON_STICKER_ALT}
              className="sticker-image"
            />
            <div className="sticker-ribbon">
              <Scissors size={12} />
              <span>EST. 1987</span>
            </div>
          </motion.div>
        </div>

        {/* Brand Title with Fade-in */}
        <motion.div
          className="entry-brand-block"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <span className="entry-eyebrow">
            {lang === 'ta' ? 'பாரம்பரிய ஹேர் பார்லர்' : 'Hair Parlour & Apothecary'}
          </span>
          <h1 className="entry-title">
            {lang === 'ta' ? 'வெல்வெட் & வைன்' : 'Velvet & Vine'}
          </h1>
          <p className="entry-subtitle">
            {t('splashSubtitle')}
          </p>
        </motion.div>

        {/* Loading Text and Animated Status Indicator */}
        <motion.div
          className="entry-loader-block"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="entry-loading-phrase">
            <motion.span
              key={phraseIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {phrases[phraseIndex]}
            </motion.span>
          </div>

          {/* Elegant Vintage Progress Bar */}
          <div className="entry-progress-bar-track">
            <motion.div
              className="entry-progress-bar-fill"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'easeInOut' }}
            />
          </div>

          <div className="entry-stars-strip">
            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}>✦</motion.span>
            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}>✦</motion.span>
            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }}>✦</motion.span>
          </div>

          {/* Catchy Manual Skip/Enter Button */}
          <button
            type="button"
            className="entry-skip-btn"
            onClick={handleManualEnter}
          >
            <span>{t('enterParlour')}</span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
