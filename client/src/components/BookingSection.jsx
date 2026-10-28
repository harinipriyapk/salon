import { useState, useEffect, useMemo } from 'react';
import { Clock, Scissors, CheckCircle, AlertCircle, MessageSquare, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import React from 'react';

const DEFAULT_SLOTS = [
  { time: '09:00', available: true },
  { time: '10:00', available: true },
  { time: '11:00', available: true },
  { time: '12:00', available: true },
  { time: '13:00', available: true },
  { time: '14:00', available: true },
  { time: '15:00', available: true },
  { time: '16:00', available: true },
  { time: '17:00', available: true },
];

export default function BookingSection({ services = [], selectedInitialServiceId = '', onBookingSuccess }) {
  const { user } = useAuth();
  const { lang, t } = useLanguage();

  const minDate = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [form, setForm] = useState({
    serviceId: selectedInitialServiceId || '',
    clientName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    date: minDate,
    time: '10:00',
    notes: '',
  });

  // Sync selectedInitialServiceId when user clicks service card
  useEffect(() => {
    if (selectedInitialServiceId) {
      setForm(prev => ({ ...prev, serviceId: selectedInitialServiceId }));
    }
  }, [selectedInitialServiceId]);

  const [availableSlots, setAvailableSlots] = useState(DEFAULT_SLOTS);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Sync user details when auth state updates
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        clientName: prev.clientName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  // Load slot availability whenever selected date changes
  useEffect(() => {
    async function fetchAvailability() {
      if (!form.date) return;
      setSlotsLoading(true);
      try {
        const res = await api.getAvailability(form.date);
        if (res.success && res.slots?.length) {
          setAvailableSlots(res.slots);
          setBookedSlots(res.bookedTimes || []);
          // If previously chosen time is now booked, switch to first free slot
          if (form.time && res.bookedTimes.includes(form.time)) {
            const firstFree = res.slots.find(s => s.available);
            setForm(prev => ({ ...prev, time: firstFree ? firstFree.time : '' }));
          }
        }
      } catch (err) {
        console.warn('Could not fetch slot availability:', err.message);
        // Fallback: keep standard slots available so user can still select time
        setAvailableSlots(DEFAULT_SLOTS);
      } finally {
        setSlotsLoading(false);
      }
    }
    fetchAvailability();
  }, [form.date]);

  const selectedService = useMemo(
    () => services.find(s => s._id === form.serviceId),
    [services, form.serviceId]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setMessage({ type: '', text: '' });
  };

  const handleSlotSelect = (timeSlot) => {
    if (bookedSlots.includes(timeSlot)) return; // Prevent clicking booked slot
    setForm(prev => ({ ...prev, time: timeSlot }));
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.serviceId) {
      setMessage({ type: 'error', text: 'Please select a salon service.' });
      return;
    }
    if (!form.time) {
      setMessage({ type: 'error', text: 'Please choose an available appointment time slot.' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });
    setConfirmedBooking(null);

    try {
      const res = await api.createBooking(form);
      if (res.success) {
        setMessage({
          type: 'success',
          text: 'Your appointment is confirmed! WhatsApp notifications dispatched to both you and our salon desk.',
        });
        setConfirmedBooking(res.booking);

        // Reset form but keep contact info
        setForm(prev => ({
          ...prev,
          serviceId: '',
          time: '',
          notes: '',
        }));

        // Refresh slots
        const updated = await api.getAvailability(form.date);
        if (updated.success) {
          setAvailableSlots(updated.slots || []);
          setBookedSlots(updated.bookedTimes || []);
        }

        if (onBookingSuccess) onBookingSuccess(res.booking);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Could not complete reservation. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="booking" className="booking-section">
      <div className="booking-intro">
        <p className="eyebrow">{t('bookingEyebrow')}</p>
        <h2>{t('bookingTitle1')} <em>{t('bookingTitle2')}</em></h2>
        <p>{t('bookingDesc')}</p>

        <div className="booking-promise">
          <MessageSquare size={18} />
          <div>
            <strong>{t('instantWaNotice')}</strong>
            <span>{t('instantWaSub')}</span>
          </div>
        </div>

        <div className="booking-promise">
          <Scissors size={18} />
          <div>
            <strong>{t('dedicatedTime')}</strong>
            <span>{t('dedicatedSub')}</span>
          </div>
        </div>
      </div>

      <div className="booking-form-wrap">
        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-heading">
            <span>№ 01</span>
            <div>
              <h3>{t('reservationDetails')}</h3>
              <p>{t('reservationSub')}</p>
            </div>
          </div>

          {message.text && (
            <div className={`form-message ${message.type}`}>
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{message.text}</span>
            </div>
          )}

          {confirmedBooking && (
            <div className="booking-confirmed-card">
              <div className="confirmed-badge">
                <CheckCircle size={15} /> Booking #{confirmedBooking._id.slice(-6).toUpperCase()}
              </div>
              <h4>{confirmedBooking.serviceName}</h4>
              <p>
                <strong>{confirmedBooking.date}</strong> at <strong>{confirmedBooking.time}</strong> • ${confirmedBooking.servicePrice}
              </p>
              <div className="whatsapp-notice-strip">
                <MessageSquare size={15} />
                <span>WhatsApp confirmation sent to <strong>{confirmedBooking.phone}</strong></span>
              </div>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Hi Velvet & Vine! I am checking in about my booking for ${confirmedBooking.serviceName} on ${confirmedBooking.date} at ${confirmedBooking.time}.`)}`}
                target="_blank"
                rel="noreferrer"
                className="button-whatsapp-link"
              >
                <span>Open in WhatsApp</span>
                <ExternalLink size={13} />
              </a>
            </div>
          )}

          {/* Service Picker */}
          <label>
            <span>{t('selectServiceLabel')}</span>
            <select
              name="serviceId"
              value={form.serviceId}
              onChange={handleChange}
              required
            >
              <option value="">{t('chooseServicePlaceholder')}</option>
              {services.map(svc => (
                <option key={svc._id} value={svc._id}>
                  {svc.name} (${svc.price} • {svc.durationMinutes} mins)
                </option>
              ))}
            </select>
          </label>

          {selectedService && (
            <div className="selected-service">
              <span>{selectedService.category} · {selectedService.durationMinutes} minutes</span>
              <strong>${selectedService.price}</strong>
            </div>
          )}

          {/* Contact Fields */}
          <div className="form-row">
            <label>
              <span>{t('fullNameLabel')}</span>
              <input
                type="text"
                name="clientName"
                value={form.clientName}
                onChange={handleChange}
                placeholder={t('fullNamePlaceholder')}
                required
              />
            </label>

            <label>
              <span>{t('phoneLabel')}</span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder={t('phonePlaceholder')}
                required
              />
            </label>
          </div>

          <label>
            <span>{t('emailLabel')} <span className="optional">{t('optionalLabel')}</span></span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="eleanor@example.com"
            />
          </label>

          {/* Date Picker */}
          <label>
            <span>{t('appointmentDateLabel')}</span>
            <input
              type="date"
              name="date"
              min={minDate}
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>

          {/* Slot Availability Logic Picker */}
          <label>
            <span>
              {t('availableSlotsLabel')} {slotsLoading && <small style={{ color: 'var(--wine)' }}>{t('checkingSlots')}</small>}
            </span>
            <div className="slot-availability-grid">
              {availableSlots.length > 0 ? (
                availableSlots.map(slot => {
                  const isBooked = !slot.available;
                  const isSelected = form.time === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={isBooked}
                      onClick={() => handleSlotSelect(slot.time)}
                      className={`slot-pill ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : 'available'}`}
                      title={isBooked ? 'Slot already reserved (double-booking prevented)' : 'Slot available'}
                    >
                      <Clock size={12} />
                      <span>{slot.time}</span>
                      {isBooked ? <span className="slot-status">{t('bookedPill')}</span> : <span className="slot-status">{t('freePill')}</span>}
                    </button>
                  );
                })
              ) : (
                <div className="slot-empty-notice">{t('slotNotice')}</div>
              )}
            </div>
          </label>

          <label>
            <span>{t('stylingNotesLabel')} <span className="optional">{t('optionalLabel')}</span></span>
            <textarea
              name="notes"
              rows={2}
              value={form.notes}
              onChange={handleChange}
              placeholder={t('stylingNotesPlaceholder')}
            />
          </label>

          <button
            type="submit"
            className="button button-dark submit-button"
            disabled={submitting || !form.time || !form.serviceId}
          >
            {submitting ? t('confirmingBooking') : t('confirmBookingBtn')}
          </button>

          <p className="form-privacy">
            {t('privacyNotice')}
          </p>
        </form>
      </div>
    </section>
  );
}

