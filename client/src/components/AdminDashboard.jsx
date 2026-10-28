import { useState, useEffect } from 'react';
import {
  Calendar, Clock, Scissors, MessageSquare, Star, CheckCircle, XCircle,
  AlertCircle, BarChart2, Bell, RefreshCw, X, ExternalLink, Send,
  Trash2, Eye, EyeOff, User, Phone, Search
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AdminMessageModal from './AdminMessageModal';
import React from "react";

export default function AdminDashboard({ isOpen, onClose }) {
  const { user } = useAuth();
  const { lang, t } = useLanguage();

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'analytics' | 'notifications' | 'services'
  const [bookings, setBookings] = useState([]);
  const [selectedBookingForMsg, setSelectedBookingForMsg] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [services, setServices] = useState([]);

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  // Custom WhatsApp message test modal state
  const [testNotif, setTestNotif] = useState({ phone: '', message: '' });
  const [sendingTest, setSendingTest] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [bRes, aRes, fRes, nRes, sRes] = await Promise.all([
        api.getBookings({ status: statusFilter, search: searchQuery }),
        api.getFeedbackAnalytics(),
        api.getAdminFeedback(),
        api.getNotifications(),
        api.getAllServicesAdmin(),
      ]);

      if (bRes.success) setBookings(bRes.bookings || []);
      if (aRes.success) setAnalytics(aRes.analytics || null);
      if (fRes.success) setFeedbackList(fRes.feedback || []);
      if (nRes.success) setNotifications(nRes.notifications || []);
      if (sRes.success) setServices(sRes.services || []);
    } catch (err) {
      console.warn('Could not load admin dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAllData();
      setActionMessage({ type: '', text: '' });
    }
  }, [isOpen, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadAllData();
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const res = await api.updateBooking(bookingId, { status: newStatus });
      if (res.success) {
        setActionMessage({
          type: 'success',
          text: `Booking updated to ${newStatus}. ${
            newStatus === 'completed'
              ? 'WhatsApp feedback reminder dispatched to customer!'
              : newStatus === 'cancelled'
              ? 'Cancellation WhatsApp notification sent to both parties.'
              : ''
          }`,
        });
        await loadAllData();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Status update failed.' });
    }
  };

  const handleSendReminder = async (bookingId) => {
    try {
      const res = await api.sendFeedbackReminder(bookingId);
      if (res.success) {
        setActionMessage({
          type: 'success',
          text: 'WhatsApp feedback reminder successfully sent to customer!',
        });
        await loadAllData();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to dispatch reminder.' });
    }
  };

  const handleToggleFeedback = async (id, currentApproved) => {
    try {
      const res = await api.moderateFeedback(id, !currentApproved);
      if (res.success) {
        setActionMessage({ type: 'success', text: 'Feedback visibility updated.' });
        await loadAllData();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to update feedback.' });
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client review?')) return;
    try {
      const res = await api.deleteFeedback(id);
      if (res.success) {
        setActionMessage({ type: 'success', text: 'Feedback deleted.' });
        await loadAllData();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to delete review.' });
    }
  };

  const handleSendCustomWhatsApp = async (e) => {
    e.preventDefault();
    if (!testNotif.phone || !testNotif.message) return;
    setSendingTest(true);
    try {
      const res = await api.sendTestNotification(testNotif);
      if (res.success) {
        setActionMessage({ type: 'success', text: 'Test WhatsApp message dispatched & recorded.' });
        setTestNotif({ phone: '', message: '' });
        await loadAllData();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to send test message.' });
    } finally {
      setSendingTest(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card vintage-card admin-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close admin dashboard">
          <X size={20} />
        </button>

        <div className="modal-header">
          <span className="vintage-tag">Parlour Management</span>
          <h2>Admin Control & Analytics</h2>
          <p>Oversee client bookings, inspect feedback analytics, and monitor WhatsApp dispatch logs.</p>
        </div>


        {/* Admin Navigation Tabs */}
        <div className="auth-tab-bar admin-nav-bar">
          <button
            type="button"
            className={`auth-tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <Calendar size={14} /> Bookings ({bookings.length})
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart2 size={14} /> Feedback Analytics
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <MessageSquare size={14} /> WhatsApp Outbox ({notifications.length})
          </button>
        </div>

        {actionMessage.text && (
          <div className={`form-message ${actionMessage.type}`} style={{ margin: '15px 0' }}>
            {actionMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* TAB 1: BOOKINGS MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div className="admin-content">
            <div className="admin-controls-bar">
              <form onSubmit={handleSearch} className="admin-search-form">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Search by client name, phone, or service..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="button button-dark" style={{ minHeight: 38, padding: '0 14px' }}>
                  Search
                </button>
              </form>

              <div className="filter-group">
                <span>Filter:</span>
                {['all', 'confirmed', 'completed', 'pending', 'cancelled'].map(st => (
                  <button
                    key={st}
                    type="button"
                    className={`filter-btn ${statusFilter === st ? 'active' : ''}`}
                    onClick={() => setStatusFilter(st)}
                  >
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="button button-outline"
                onClick={loadAllData}
                title="Refresh bookings"
                style={{ minHeight: 38, padding: '0 12px' }}
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {loading ? (
              <div className="dashboard-loading">Refreshing salon records...</div>
            ) : bookings.length === 0 ? (
              <div className="dashboard-empty">
                <Calendar size={32} />
                <p>No bookings match the selected criteria.</p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ref & Client</th>
                      <th>Service & Price</th>
                      <th>Date & Slot</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b._id} className={`row-${b.status}`}>
                        <td>
                          <strong>{b.clientName}</strong>
                          <div className="sub-detail">
                            <Phone size={11} /> {b.phone}
                          </div>
                          <div className="sub-detail" style={{ fontSize: 9 }}>
                            Ref: #{b._id.slice(-6).toUpperCase()}
                          </div>
                        </td>
                        <td>
                          <strong>{b.serviceName}</strong>
                          <div className="sub-detail">${b.servicePrice} · {b.durationMinutes}m</div>
                          {b.notes && <div className="sub-detail notes-preview">"{b.notes}"</div>}
                        </td>
                        <td>
                          <strong>{b.date}</strong>
                          <div className="sub-detail"><Clock size={11} /> {b.time}</div>
                        </td>
                        <td>
                          <span className={`status-pill ${b.status}`}>{b.status}</span>
                          {b.feedbackReminderSent && (
                            <div className="reminder-sent-tag">
                              <CheckCircle size={10} /> Reminder Sent
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="table-actions">
                            {b.status === 'confirmed' && (
                              <button
                                type="button"
                                className="button button-dark table-btn"
                                onClick={() => handleUpdateStatus(b._id, 'completed')}
                                title="Mark completed & send feedback reminder via WhatsApp"
                              >
                                Mark Completed
                              </button>
                            )}

                            {b.status === 'completed' && (
                              <button
                                type="button"
                                className="button button-outline table-btn"
                                onClick={() => handleSendReminder(b._id)}
                                title="Re-dispatch WhatsApp feedback reminder"
                              >
                                <Send size={11} /> Send Reminder
                              </button>
                            )}

                            {b.status !== 'cancelled' && (
                              <button
                                type="button"
                                className="button button-danger table-btn"
                                onClick={() => handleUpdateStatus(b._id, 'cancelled')}
                                title="Cancel and alert both parties on WhatsApp"
                              >
                                Cancel
                              </button>
                            )}

                            <button
                              type="button"
                              className="button button-msg-client table-btn"
                              onClick={() => setSelectedBookingForMsg(b)}
                              title="Send direct message to client & WhatsApp alert"
                            >
                              <MessageSquare size={11} /> {t('sendMessageToClientBtn')}
                              {b.adminMessages?.length > 0 && (
                                <span className="msg-count-chip">{b.adminMessages.length}</span>
                              )}
                            </button>

                            <a
                              href={`https://wa.me/${b.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Hi ${b.clientName}, this is Velvet & Vine Parlour regarding your booking for ${b.serviceName} on ${b.date} at ${b.time}.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="wa-chat-link"
                              title="Chat with client on WhatsApp"
                            >
                              <MessageSquare size={13} /> WhatsApp
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FEEDBACK ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="admin-content">
            {/* KPI Summary Cards */}
            <div className="analytics-kpi-grid">
              <div className="kpi-card">
                <span className="kpi-label">Average Satisfaction</span>
                <div className="kpi-value">
                  <Star size={24} fill="currentColor" color="var(--gold)" />
                  <span>{analytics?.averageRating || '5.0'}</span>
                  <small>/ 5.0</small>
                </div>
                <span className="kpi-sub">Across all verified parlour reviews</span>
              </div>

              <div className="kpi-card">
                <span className="kpi-label">Total Verified Reviews</span>
                <div className="kpi-value">
                  <span>{analytics?.totalReviews || feedbackList.length}</span>
                </div>
                <span className="kpi-sub">Strictly validated against completed bookings</span>
              </div>

              <div className="kpi-card">
                <span className="kpi-label">5-Star Excellence</span>
                <div className="kpi-value">
                  <span>
                    {analytics?.distribution
                      ? Math.round(((analytics.distribution[5] || 0) / (analytics.totalReviews || 1)) * 100)
                      : 100}%
                  </span>
                </div>
                <span className="kpi-sub">{analytics?.distribution?.[5] || 0} top-tier ratings</span>
              </div>
            </div>

            {/* Distribution Bar Chart */}
            <div className="analytics-section-card">
              <h4>Rating Distribution</h4>
              <div className="rating-bars-wrap">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = analytics?.distribution?.[stars] || 0;
                  const total = analytics?.totalReviews || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={stars} className="rating-bar-row">
                      <span className="bar-stars">{stars} ★</span>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="bar-count">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Service Breakdown */}
            {analytics?.serviceBreakdown?.length > 0 && (
              <div className="analytics-section-card">
                <h4>Service Satisfaction Breakdown</h4>
                <div className="service-breakdown-grid">
                  {analytics.serviceBreakdown.map(svc => (
                    <div key={svc.serviceName} className="service-kpi-item">
                      <strong>{svc.serviceName}</strong>
                      <div className="service-kpi-score">
                        <Star size={14} fill="currentColor" color="var(--gold)" />
                        <span>{svc.averageRating}</span>
                        <small>({svc.reviewsCount} reviews)</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Moderation List */}
            <div className="analytics-section-card">
              <h4>Client Reviews & Moderation</h4>
              <div className="admin-reviews-list">
                {feedbackList.map(item => (
                  <article key={item._id} className="admin-review-card">
                    <div className="review-top">
                      <div>
                        <strong>{item.clientName || 'Client'}</strong>
                        <span className="review-service-tag">{item.serviceName}</span>
                      </div>
                      <div className="stars">
                        {'★'.repeat(item.rating)}
                        <span className="star-empty">{'★'.repeat(5 - item.rating)}</span>
                      </div>
                    </div>
                    <blockquote>"{item.comment}"</blockquote>
                    <div className="review-footer">
                      <small>{new Date(item.createdAt).toLocaleDateString()}</small>
                      <div className="review-actions">
                        <button
                          type="button"
                          className="button-icon-action"
                          onClick={() => handleToggleFeedback(item._id, item.approved)}
                          title={item.approved ? 'Hide review from public' : 'Approve for public showcase'}
                        >
                          {item.approved ? <Eye size={15} /> : <EyeOff size={15} />}
                          <span>{item.approved ? 'Public' : 'Hidden'}</span>
                        </button>
                        <button
                          type="button"
                          className="button-icon-action danger"
                          onClick={() => handleDeleteFeedback(item._id)}
                          title="Delete review"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WHATSAPP OUTBOX & NOTIFICATION LOGS */}
        {activeTab === 'notifications' && (
          <div className="admin-content">
            <div className="notification-center-intro">
              <div>
                <h4>WhatsApp Dispatch Center</h4>
                <p>
                  Audit all automated WhatsApp notifications: booking confirmations, cancellation alerts,
                  and post-appointment feedback reminders.
                </p>
              </div>

              {/* Direct Test Dispatch Form */}
              <form onSubmit={handleSendCustomWhatsApp} className="custom-wa-form">
                <input
                  type="tel"
                  placeholder="+15551234567"
                  value={testNotif.phone}
                  onChange={e => setTestNotif(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
                <input
                  type="text"
                  placeholder="Test WhatsApp message content..."
                  value={testNotif.message}
                  onChange={e => setTestNotif(prev => ({ ...prev, message: e.target.value }))}
                  required
                />
                <button
                  type="submit"
                  className="button button-dark"
                  disabled={sendingTest}
                  style={{ minHeight: 38 }}
                >
                  <Send size={14} /> {sendingTest ? 'Sending...' : 'Send Test'}
                </button>
              </form>
            </div>

            <div className="notifications-list">
              {notifications.length === 0 ? (
                <div className="dashboard-empty">
                  <MessageSquare size={32} />
                  <p>No WhatsApp notifications sent yet.</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <article key={notif._id} className="notification-card">
                    <div className="notif-header">
                      <div className="notif-type-tag">
                        <MessageSquare size={14} />
                        <span className={`pill-type ${notif.type}`}>
                          {notif.type === 'booking_confirmation' && 'Booking Confirmation'}
                          {notif.type === 'cancellation' && 'Cancellation Alert'}
                          {notif.type === 'feedback_reminder' && 'Feedback Reminder'}
                          {notif.type === 'custom' && 'Direct Dispatch'}
                        </span>
                      </div>
                      <span className={`notif-status ${notif.status}`}>
                        {notif.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="notif-recipient">
                      <strong>To:</strong> {notif.recipientName || 'Recipient'} ({notif.recipientPhone}) · Role: {notif.recipientRole}
                    </div>

                    <pre className="notif-body">{notif.message}</pre>

                    <div className="notif-footer">
                      <small>{new Date(notif.createdAt).toLocaleString()}</small>
                      {notif.whatsappUrl && (
                        <a
                          href={notif.whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="button-whatsapp-link"
                          style={{ padding: '6px 10px', fontSize: 10 }}
                        >
                          <span>Open Chat</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        )}

        {/* Admin Message Dispatch Modal */}
        <AdminMessageModal
          isOpen={!!selectedBookingForMsg}
          booking={selectedBookingForMsg}
          onClose={() => setSelectedBookingForMsg(null)}
          onMessageSent={() => loadAllData()}
        />
      </div>
    </div>
  );
}

