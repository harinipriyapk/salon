import { useState, useEffect } from 'react';
import {
  Calendar, Clock, Scissors, MessageSquare, Star, Edit3, XCircle, CheckCircle,
  AlertCircle, ChevronRight, RefreshCw, X, ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import React from "react";
export default function UserDashboard({ isOpen, onClose, services = [] }) {
  const { user } = useAuth();
  const { lang, t } = useLanguage();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'feedback'
  const [message, setMessage] = useState({ type: '', text: '' });

  // Reschedule / Edit State
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({ date: '', time: '', serviceId: '', notes: '' });
  const [editSlots, setEditSlots] = useState([]);
  const [editSlotsLoading, setEditSlotsLoading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Feedback State
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [selectedEligible, setSelectedEligible] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, eligibleRes] = await Promise.all([
        api.getBookings(),
        api.getEligibleBookings(),
      ]);

      if (bookingsRes.success) {
        setBookings(bookingsRes.bookings || []);
        // Automatically mark unread messages as read once viewed
        bookingsRes.bookings?.forEach(b => {
          if (b.adminMessages?.some(m => !m.readByClient)) {
            api.markMessagesRead(b._id).catch(() => {});
          }
        });
      }
      if (eligibleRes.success) {
        setEligibleBookings(eligibleRes.eligibleBookings || []);
        if (eligibleRes.eligibleBookings.length > 0) {
          setSelectedEligible(eligibleRes.eligibleBookings[0]._id);
        }
      }
    } catch (err) {
      console.warn('Failed to load user dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setMessage({ type: '', text: '' });
      // Poll every 4 seconds for real-time messages sent by admin
      const interval = setInterval(() => {
        api.getBookings().then(res => {
          if (res.success && res.bookings) {
            setBookings(res.bookings);
          }
        }).catch(() => {});
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Load slot availability when editing booking date changes
  useEffect(() => {
    async function fetchEditSlots() {
      if (!editForm.date) return;
      setEditSlotsLoading(true);
      try {
        const res = await api.getAvailability(editForm.date);
        if (res.success) {
          setEditSlots(res.slots || []);
        }
      } catch (err) {
        console.warn('Could not fetch edit slots:', err.message);
      } finally {
        setEditSlotsLoading(false);
      }
    }
    if (editingBooking && editForm.date) {
      fetchEditSlots();
    }
  }, [editForm.date, editingBooking]);

  const handleOpenEdit = (booking) => {
    setEditingBooking(booking);
    setEditForm({
      date: booking.date,
      time: booking.time,
      serviceId: booking.serviceId?._id || booking.serviceId || '',
      notes: booking.notes || '',
    });
    setMessage({ type: '', text: '' });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.time) {
      setMessage({ type: 'error', text: 'Please select an available time slot.' });
      return;
    }

    setSavingEdit(true);
    try {
      const res = await api.updateBooking(editingBooking._id, editForm);
      if (res.success) {
        setMessage({ type: 'success', text: 'Reservation rescheduled successfully!' });
        setEditingBooking(null);
        await loadData();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Could not reschedule appointment.' });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? A WhatsApp cancellation alert will be sent.')) {
      return;
    }

    try {
      const res = await api.cancelBooking(bookingId);
      if (res.success) {
        setMessage({
          type: 'success',
          text: 'Appointment cancelled. WhatsApp notifications dispatched to you and the parlour.',
        });
        await loadData();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Could not cancel booking.' });
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!selectedEligible) {
      setMessage({ type: 'error', text: 'Please select an appointment.' });
      return;
    }
    if (!feedbackComment.trim()) {
      setMessage({ type: 'error', text: 'Please write a brief comment.' });
      return;
    }

    setFeedbackSubmitting(true);
    try {
      const res = await api.submitFeedback({
        bookingId: selectedEligible,
        rating: feedbackRating,
        comment: feedbackComment.trim(),
      });

      if (res.success) {
        setMessage({ type: 'success', text: 'Your verified feedback has been posted! Thank you.' });
        setFeedbackComment('');
        await loadData();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Feedback submission failed.' });
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card vintage-card dashboard-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close dashboard">
          <X size={20} />
        </button>

        <div className="modal-header">
          <span className="vintage-tag">Client Dashboard</span>
          <h2>Welcome, {user?.name || 'Valued Guest'}</h2>
          <p>View, edit, or cancel your chair reservations and share feedback on your parlour experiences.</p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tab-bar">
          <button
            type="button"
            className={`auth-tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            My Reservations ({bookings.length})
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            Leave Feedback ({eligibleBookings.length} Eligible)
          </button>
        </div>

        {message.text && (
          <div className={`form-message ${message.type}`} style={{ margin: '15px 0' }}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab 1: View / Edit / Cancel Reservations */}
        {activeTab === 'bookings' && (
          <div className="dashboard-content">
            {loading ? (
              <div className="dashboard-loading">Loading your appointments...</div>
            ) : bookings.length === 0 ? (
              <div className="dashboard-empty">
                <Calendar size={32} />
                <p>You have not made any salon reservations yet.</p>
                <a href="#booking" onClick={onClose} className="button button-dark">
                  Reserve an Appointment Now
                </a>
              </div>
            ) : (
              <div className="dashboard-list">
                {bookings.map(b => {
                  const isCancelled = b.status === 'cancelled';
                  const isCompleted = b.status === 'completed';
                  return (
                    <article key={b._id} className={`dashboard-item ${b.status}`}>
                      <div className="item-main">
                        <div className="item-header">
                          <span className={`status-pill ${b.status}`}>
                            {b.status.toUpperCase()}
                          </span>
                          <span className="item-id">Ref #{b._id.slice(-6).toUpperCase()}</span>
                        </div>
                        <h4>{b.serviceName}</h4>
                        <div className="item-meta">
                          <span><Calendar size={13} /> {b.date}</span>
                          <span><Clock size={13} /> {b.time} ({b.durationMinutes}m)</span>
                          <span><strong>${b.servicePrice}</strong></span>
                        </div>
                        {b.notes && <p className="item-notes">"{b.notes}"</p>}
                        <div className="item-wa-status">
                          <MessageSquare size={13} />
                          <span>WhatsApp notifications linked to {b.phone}</span>
                        </div>

                        {/* Messages Sent by Admin Received by Client */}
                        {b.adminMessages && b.adminMessages.length > 0 && (
                          <div className="client-admin-messages-thread">
                            <div className="messages-thread-header">
                              <MessageSquare size={13} />
                              <strong>{t('adminMessageBadge')}</strong>
                              {b.adminMessages.some(m => !m.readByClient) && (
                                <span className="unread-badge">{t('newAdminMessage')}</span>
                              )}
                            </div>
                            <div className="messages-thread-list">
                              {b.adminMessages.map((msg, mIdx) => (
                                <div key={mIdx} className="admin-msg-bubble">
                                  <div className="admin-msg-header">
                                    <span className="admin-sender-name">{msg.senderName || 'Salon Director'}</span>
                                    <small>{new Date(msg.sentAt || msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                                  </div>
                                  <p className="admin-msg-body">"{msg.message}"</p>
                                </div>
                              ))}
                            </div>
                            <a
                              href={`https://wa.me/?text=${encodeURIComponent(`Hi Velvet & Vine! Replying to your message regarding my booking for ${b.serviceName} on ${b.date} at ${b.time}.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="button-reply-whatsapp"
                            >
                              <MessageSquare size={12} />
                              <span>{t('replyOnWhatsApp')}</span>
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="item-actions">
                        {!isCancelled && !isCompleted && (
                          <>
                            <button
                              type="button"
                              className="button button-outline item-btn"
                              onClick={() => handleOpenEdit(b)}
                            >
                              <Edit3 size={14} /> Reschedule
                            </button>
                            <button
                              type="button"
                              className="button button-danger item-btn"
                              onClick={() => handleCancelBooking(b._id)}
                            >
                              <XCircle size={14} /> Cancel
                            </button>
                          </>
                        )}
                        {isCompleted && (
                          <button
                            type="button"
                            className="button button-dark item-btn"
                            onClick={() => {
                              setSelectedEligible(b._id);
                              setActiveTab('feedback');
                            }}
                          >
                            <Star size={14} /> Leave Review
                          </button>
                        )}
                        {isCancelled && (
                          <span className="cancelled-note">Reservation Cancelled</span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Submit Feedback after appointment */}
        {activeTab === 'feedback' && (
          <div className="dashboard-content">
            <div className="feedback-flow-card">
              <div className="feedback-flow-header">
                <ShieldCheck size={20} />
                <div>
                  <h4>Verified Feedback Validation</h4>
                  <p>Only completed appointments are eligible for review submission.</p>
                </div>
              </div>

              {eligibleBookings.length === 0 ? (
                <div className="feedback-no-eligible">
                  <Star size={26} />
                  <p>You have no completed appointments pending feedback right now.</p>
                  <small>Once your visit is completed by the salon, you can rate and review it here!</small>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="feedback-fields" style={{ marginTop: 20 }}>
                  <label className="eligible-picker-label">
                    <span>Select Completed Appointment</span>
                    <select
                      value={selectedEligible}
                      onChange={e => setSelectedEligible(e.target.value)}
                      required
                    >
                      {eligibleBookings.map(b => (
                        <option key={b._id} value={b._id}>
                          {b.serviceName} ({b.date} at {b.time}) — ${b.servicePrice}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="rating-picker-wrap">
                    <label><span>Rating (1 to 5 Stars ⭐)</span></label>
                    <div className="interactive-stars">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${feedbackRating >= star ? 'active' : ''}`}
                          onClick={() => setFeedbackRating(star)}
                        >
                          <Star size={24} fill={feedbackRating >= star ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="comment-field">
                    <span>Comments on your visit</span>
                    <textarea
                      rows={3}
                      value={feedbackComment}
                      onChange={e => setFeedbackComment(e.target.value)}
                      placeholder="Share how your stylist took care of you, the ambiance, and the results..."
                      required
                    />
                  </label>

                  <button
                    type="submit"
                    className="button button-dark"
                    disabled={feedbackSubmitting || !feedbackComment.trim()}
                  >
                    {feedbackSubmitting ? 'Posting...' : 'Submit Verified Feedback'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Reschedule Modal Sub-View */}
        {editingBooking && (
          <div className="nested-modal-backdrop">
            <div className="nested-modal-card vintage-card">
              <div className="form-heading">
                <span>№ 02</span>
                <div>
                  <h3>Reschedule Appointment</h3>
                  <p>Change your date, time slot, or notes for {editingBooking.serviceName}</p>
                </div>
              </div>

              <form onSubmit={handleSaveEdit}>
                <label>
                  <span>Select New Date</span>
                  <input
                    type="date"
                    value={editForm.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setEditForm(prev => ({ ...prev, date: e.target.value, time: '' }))}
                    required
                  />
                </label>

                <label>
                  <span>
                    Available Time Slots {editSlotsLoading && <small>(checking availability...)</small>}
                  </span>
                  <div className="slot-availability-grid">
                    {editSlots.map(slot => {
                      const isBooked = !slot.available && slot.time !== editingBooking.time;
                      const isSelected = editForm.time === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setEditForm(prev => ({ ...prev, time: slot.time }))}
                          className={`slot-pill ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : 'available'}`}
                        >
                          <Clock size={12} />
                          <span>{slot.time}</span>
                          {isBooked ? <span className="slot-status">Booked</span> : <span className="slot-status">Free</span>}
                        </button>
                      );
                    })}
                  </div>
                </label>

                <label>
                  <span>Notes</span>
                  <textarea
                    rows={2}
                    value={editForm.notes}
                    onChange={e => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </label>

                <div className="modal-actions-row">
                  <button
                    type="button"
                    className="button button-outline"
                    onClick={() => setEditingBooking(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="button button-dark"
                    disabled={savingEdit || !editForm.time}
                  >
                    {savingEdit ? 'Rescheduling...' : 'Confirm Reschedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

