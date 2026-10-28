import { useState, useEffect } from 'react';
import { Star, MessageSquare, CheckCircle, AlertCircle, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import React from "react";
export default function ReviewsSection({ openAuthModal }) {
  const { user, isAuthenticated } = useAuth();
  const { lang, t } = useLanguage();

  const [feedbackList, setFeedbackList] = useState([]);
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [loadingEligible, setLoadingEligible] = useState(false);

  const [form, setForm] = useState({
    bookingId: '',
    rating: 5,
    comment: '',
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load public reviews
  const loadReviews = async () => {
    try {
      const res = await api.getPublicFeedback();
      if (res.success) {
        setFeedbackList(res.feedback || []);
      }
    } catch (err) {
      console.warn('Could not fetch reviews:', err.message);
    }
  };

  // Load user's completed bookings eligible for review
  const loadEligibleBookings = async () => {
    if (!isAuthenticated) {
      setEligibleBookings([]);
      return;
    }
    setLoadingEligible(true);
    try {
      const res = await api.getEligibleBookings();
      if (res.success) {
        setEligibleBookings(res.eligibleBookings || []);
        if (res.eligibleBookings.length > 0 && !form.bookingId) {
          setForm(prev => ({ ...prev, bookingId: res.eligibleBookings[0]._id }));
        }
      }
    } catch (err) {
      console.warn('Could not fetch eligible bookings:', err.message);
    } finally {
      setLoadingEligible(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    loadEligibleBookings();
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bookingId) {
      setMessage({ type: 'error', text: 'Please select which completed appointment you are reviewing.' });
      return;
    }
    if (!form.comment.trim()) {
      setMessage({ type: 'error', text: 'Please share your comments on the styling experience.' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.submitFeedback({
        bookingId: form.bookingId,
        rating: form.rating,
        comment: form.comment.trim(),
      });

      if (res.success) {
        setMessage({
          type: 'success',
          text: 'Thank you! Your verified review and rating have been posted.',
        });
        setForm({ bookingId: '', rating: 5, comment: '' });
        await loadReviews();
        await loadEligibleBookings();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Could not submit feedback.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = feedbackList.length > 0
    ? (feedbackList.reduce((acc, f) => acc + (f.rating || 5), 0) / feedbackList.length).toFixed(1)
    : '5.0';

  return (
    <section id="reviews" className="reviews-section">
      <div className="section-heading review-heading">
        <div>
          <p className="eyebrow">{t('kindWords')}</p>
          <h2>{lang === 'ta' ? 'வாடிக்கையாளர்களின் அனுபவங்கள்.' : 'Thoughts from the chair.'}</h2>
        </div>
        <div className="rating-summary">
          <div>
            {'★'.repeat(5)} <strong>{averageRating}</strong>
          </div>
          <small>{lang === 'ta' ? `${feedbackList.length} உறுதிப்படுத்தப்பட்ட அனுபவங்களின் அடிப்படையில்` : `Based on ${feedbackList.length} verified parlour experiences`}</small>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="review-grid">
        {feedbackList.length > 0 ? (
          feedbackList.map(item => (
            <article key={item._id} className="review-card">
              <div className="stars">
                {'★'.repeat(item.rating || 5)}
                <span className="star-empty">{'★'.repeat(5 - (item.rating || 5))}</span>
              </div>
              <blockquote>"{item.comment}"</blockquote>
              <p className="review-author">{item.clientName || 'Valued Client'}</p>
              <small>
                {item.serviceName || 'Parlour Experience'} · {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </small>
            </article>
          ))
        ) : (
          <div className="reviews-empty">
            <span>✦ ✦ ✦</span>
            <p>{lang === 'ta' ? 'எங்கள் விருந்தினர் குறிப்பேடு உங்கள் அன்புச் சொற்களுக்காகக் காத்திருக்கிறது.' : 'Our guestbook is waiting for your kind words.'}</p>
          </div>
        )}
      </div>

      {/* Verified Feedback Submission Form */}
      <div className="feedback-form vintage-card">
        <div className="feedback-form-header">
          <div>
            <p className="eyebrow">{lang === 'ta' ? 'வாடிக்கையாளர் பதிவுகள்' : 'Client Reflections'}</p>
            <h3>{lang === 'ta' ? 'உங்கள் மதிப்பீடு & விமர்சனத்தை பதிவுசெய்யுங்கள்' : 'Leave your review & rating'}</h3>
          </div>
          <div className="feedback-badge-verified">
            <ShieldCheck size={16} />
            <span>{t('verifiedRequired')}</span>
          </div>
        </div>

        {message.text && (
          <div className={`form-message ${message.type}`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="feedback-auth-gate">
            <UserCheck size={28} />
            <h4>{lang === 'ta' ? 'உறுதிப்படுத்தப்பட்ட வாடிக்கையாளர் மதிப்பீடுகள்' : 'Verified Client Reviews'}</h4>
            <p>
              {t('signInToReview')}
            </p>
            <button
              type="button"
              className="button button-dark"
              onClick={() => openAuthModal && openAuthModal('login')}
            >
              {t('signInToLeaveFeedbackBtn')}
            </button>
          </div>
        ) : eligibleBookings.length === 0 ? (
          <div className="feedback-no-eligible">
            <Sparkles size={24} />
            <h4>{t('noEligibleBookings')}</h4>
            <p>
              {lang === 'ta'
                ? `வணக்கம் ${user?.name || ''}! உங்கள் சந்திப்பு நிறைவடைந்தவுடன் பார்லர் குழு வாட்ஸ்அப் நினைவூட்டல் அனுப்பும். அப்போது இந்த படிவம் திறக்கப்படும்!`
                : `Hello ${user?.name || ''}! You currently have no completed appointments awaiting a review. Once you attend an appointment and it is marked completed by our parlour team, you will receive a WhatsApp reminder and your review form will unlock right here!`
              }
            </p>
            {user?.role === 'admin' && (
              <p className="admin-tip">
                💡 <em>{t('adminTipReview')}</em>
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="feedback-fields">
            {/* Select eligible completed appointment */}
            <label className="eligible-picker-label">
              <span>{t('chooseCompletedVisit')}</span>
              <select
                value={form.bookingId}
                onChange={e => setForm(prev => ({ ...prev, bookingId: e.target.value }))}
                required
              >
                {eligibleBookings.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.serviceName} on {b.date} at {b.time} (${b.servicePrice})
                  </option>
                ))}
              </select>
            </label>

            {/* Interactive Star Rating */}
            <div className="rating-picker-wrap">
              <label>
                <span>{t('yourRatingLabel')}</span>
              </label>
              <div className="interactive-stars">
                {[1, 2, 3, 4, 5].map(star => {
                  const active = (hoverRating || form.rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${active ? 'active' : ''}`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setForm(prev => ({ ...prev, rating: star }))}
                      aria-label={`${star} star`}
                    >
                      <Star size={24} fill={active ? 'currentColor' : 'none'} />
                    </button>
                  );
                })}
                <span className="rating-label-hint">
                  {form.rating === 5 && (lang === 'ta' ? 'அருமை' : 'Exquisite')}
                  {form.rating === 4 && (lang === 'ta' ? 'மிகவும் நன்று' : 'Very Pleased')}
                  {form.rating === 3 && (lang === 'ta' ? 'நன்று' : 'Good')}
                  {form.rating === 2 && (lang === 'ta' ? 'பரவாயில்லை' : 'Fair')}
                  {form.rating === 1 && (lang === 'ta' ? 'மேம்பட வேண்டும்' : 'Needs Improvement')}
                </span>
              </div>
            </div>

            {/* Comment */}
            <label className="comment-field">
              <span>{t('yourReviewLabel')}</span>
              <textarea
                rows={3}
                value={form.comment}
                onChange={e => setForm(prev => ({ ...prev, comment: e.target.value }))}
                placeholder={t('reviewPlaceholder')}
                required
              />
            </label>

            <button
              type="submit"
              className="button button-dark"
              disabled={submitting || !form.comment.trim()}
            >
              {submitting ? t('submittingReview') : t('submitReviewBtn')}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

