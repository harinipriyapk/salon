import { useState } from 'react';
import { X, Send, MessageSquare, Sparkles, CheckCircle, AlertCircle, Phone, Calendar, Clock, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import React from 'react';


export default function AdminMessageModal({ isOpen, onClose, booking, onMessageSent }) {
  const { lang, t } = useLanguage();
  const [messageText, setMessageText] = useState('');
  const [senderName, setSenderName] = useState('Eleanor Vance (Salon Director)');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState({ type: '', text: '' });

  if (!isOpen || !booking) return null;

  const quickTemplates = lang === 'ta'
    ? [
        'உங்கள் இருக்கை தயார்: உங்களை அன்புடன் வரவேற்க ஆவலுடன் காத்திருக்கிறோம்!',
        'தயவுசெய்து 5 நிமிடங்கள் முன்னதாக வந்து எங்கள் சிறப்பு மூலிகை தேநீரை ருசியுங்கள்.',
        'சிகையலங்கார குறிப்பு: உங்களுக்குப் பிடித்த புகைப்படங்கள் இருப்பின் எடுத்து வரலாம்.',
        'சிறப்புச் சலுகை: இன்றைய வருகையின் போது டீப் கண்டிஷனிங் சிகிச்சையில் 10% தள்ளுபடி பெறுங்கள்.',
      ]
    : [
        'Your styling chair is reserved! We look forward to welcoming you today.',
        'Please feel free to arrive 5 minutes early to enjoy a warm cup of herbal tea.',
        'Stylist Note: If you have hairstyle inspiration photos, feel free to bring them along!',
        'Parlour Perk: Enjoy 10% off our Restorative Treatment during your visit today.',
      ];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) {
      setResult({ type: 'error', text: 'Please write a message or select a template.' });
      return;
    }

    setBusy(true);
    setResult({ type: '', text: '' });

    try {
      const res = await api.sendMessageToClient(booking._id, {
        message: messageText.trim(),
        senderName: senderName.trim(),
      });

      if (res.success) {
        setResult({
          type: 'success',
          text: 'Message dispatched! Recorded in client dashboard & WhatsApp alert sent.',
        });
        setMessageText('');
        if (onMessageSent) onMessageSent(res.booking);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      setResult({ type: 'error', text: err.message || 'Failed to send message.' });
    } finally {
      setBusy(false);
    }
  };

  const directWaUrl = `https://wa.me/${booking.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
    messageText || `Hi ${booking.clientName}, this is Velvet & Vine Parlour regarding your appointment on ${booking.date} at ${booking.time}.`
  )}`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card vintage-card admin-message-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="modal-header">
          <span className="vintage-tag">Direct Client Dispatch</span>
          <h2>{t('adminComposerTitle')}</h2>
          <p>{t('adminComposerSub')}</p>
        </div>

        {/* Client & Booking Context Banner */}
        <div className="admin-msg-client-strip">
          <div className="client-chip">
            <strong>{booking.clientName}</strong>
            <span><Phone size={11} /> {booking.phone}</span>
          </div>
          <div className="booking-chip">
            <span>{booking.serviceName}</span>
            <span><Calendar size={11} /> {booking.date} · <Clock size={11} /> {booking.time}</span>
          </div>
        </div>

        {result.text && (
          <div className={`form-message ${result.type}`} style={{ margin: '12px 0' }}>
            {result.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{result.text}</span>
          </div>
        )}

        {/* Quick Catchy Templates */}
        <div className="quick-templates-section">
          <div className="quick-templates-title">
            <Sparkles size={13} />
            <span>{t('quickTemplates')}</span>
          </div>
          <div className="quick-templates-list">
            {quickTemplates.map((template, idx) => (
              <button
                key={idx}
                type="button"
                className="template-pill"
                onClick={() => setMessageText(template)}
              >
                "{template}"
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSend} className="admin-msg-form">
          <label>
            <span>Sender Title</span>
            <input
              type="text"
              value={senderName}
              onChange={e => setSenderName(e.target.value)}
              placeholder="e.g. Eleanor Vance (Salon Director)"
              required
            />
          </label>

          <label>
            <span>Message Content (Received by Client Dashboard & WhatsApp)</span>
            <textarea
              rows={4}
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              placeholder={t('customMessagePlaceholder')}
              required
            />
          </label>

          <div className="admin-msg-actions">
            <a
              href={directWaUrl}
              target="_blank"
              rel="noreferrer"
              className="button-whatsapp-link"
              title="Open directly in WhatsApp Web"
            >
              <MessageSquare size={13} />
              <span>{t('openInWhatsApp')}</span>
              <ExternalLink size={12} />
            </a>

            <button
              type="submit"
              className="button button-dark"
              disabled={busy || !messageText.trim()}
            >
              <Send size={14} />
              <span>{busy ? t('sendingMessage') : t('sendAndDispatchBtn')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

