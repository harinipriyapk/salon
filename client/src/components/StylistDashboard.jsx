import { useEffect, useState } from 'react';
import { Calendar, Clock, Scissors, X } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import React from 'react';

const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export default function StylistDashboard({ isOpen, onClose }) {
  const { user } = useAuth();
  const [date, setDate] = useState(today());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.getBookings({ date, status: 'all', limit: 100 });
        if (mounted) { setBookings((res.bookings || []).filter(item => item.status !== 'cancelled')); setError(''); }
      } catch (err) {
        if (mounted) setError(err.message || 'Could not load your schedule.');
      } finally { if (mounted) setLoading(false); }
    };
    load();
    const timer = setInterval(load, 15000);
    return () => { mounted = false; clearInterval(timer); };
  }, [isOpen, date]);

  if (!isOpen) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card vintage-card dashboard-modal stylist-dashboard" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close stylist dashboard"><X size={20} /></button>
        <div className="modal-header">
          <span className="vintage-tag">Stylist Schedule</span>
          <h2>{user?.name || 'Stylist'}</h2>
          <p>Your booked appointments for the selected day.</p>
        </div>
        <label className="schedule-date-control">Schedule date <input type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
        {error && <div className="form-message error">{error}</div>}
        {loading ? <div className="dashboard-loading">Loading schedule…</div> : bookings.length ? (
          <div className="stylist-own-bookings">
            {[...bookings].sort((a, b) => a.time.localeCompare(b.time)).map(item => (
              <article className="stylist-own-booking" key={item._id}>
                <div className="stylist-own-time"><Clock size={16} /> {item.time}</div>
                <div><h3>{item.clientName}</h3><p><Scissors size={13} /> {item.serviceName} · {item.durationMinutes} min</p></div>
                <span className={`status-pill ${item.status}`}>{item.status}</span>
              </article>
            ))}
          </div>
        ) : <div className="dashboard-empty"><Calendar size={30} /><p>No bookings for this date.</p></div>}
      </div>
    </div>
  );
}
