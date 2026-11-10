import React, { useState } from 'react';
import { ArrowDown, ArrowRight, Clock3, Instagram, MapPin, Scissors, MessageCircle, Menu, X } from 'lucide-react';
import BookingSection from './components/BookingSection';
import EntrySplash from './components/EntrySplash';
import { LanguageProvider } from './context/LanguageContext';
//import react from 'react';
const services = [
  { id: 'cut', category: 'CUT & STYLE', name: 'The signature cut', description: 'A considered cut, finished with a soft, lived-in blow dry.', duration: 60, price: 900 },
  { id: 'colour', category: 'COLOUR', name: 'Colour, your way', description: 'Dimensional colour thoughtfully matched to you.', duration: 150, price: 3200 },
  { id: 'gloss', category: 'TREATMENTS', name: 'Gloss & nourish', description: 'A deep-conditioning ritual for shine and softness.', duration: 45, price: 1200 },
  { id: 'blowout', category: 'CUT & STYLE', name: 'The good blowout', description: 'A bouncy, lasting finish for any occasion.', duration: 45, price: 700 },
  { id: 'bridal', category: 'SPECIAL OCCASION', name: 'Event styling', description: 'An effortless up-do or polished style for your day.', duration: 90, price: 2200 },
  { id: 'fringe', category: 'CUT & STYLE', name: 'A little refresh', description: 'A tidy trim and fringe refresh between visits.', duration: 25, price: 450 },
];
const photos = [
  ['photo-1521590832167-7bcbfaa6381f', 'A sunlit salon chair'], ['photo-1560066984-138dadb4c035', 'A stylist at work'], ['photo-1522337360788-8b13dee7a37e', 'A polished hairstyle'], ['photo-1487412720507-e7ab37603c6f', 'A fresh salon look'], ['photo-1524250502761-1ac6f2e30d43', 'Soft waves'], ['photo-1519699047748-de8e457a634e', 'A joyful client']
].map(([id, alt]) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=760&q=82`);
const staff = [
  { name: 'Ramesh', role: 'Creative Director', focus: 'Precision cuts · Signature colour', image: 'photo-1506794778202-cad84cf45f1d' },
  { name: 'Suresh', role: 'Senior Stylist', focus: 'Soft layers · Occasion styling', image: 'photo-1500648767791-00dcc994a43e' },
  { name: 'Rajesh', role: 'Colour Specialist', focus: 'Balayage · Healthy hair', image: 'photo-1507003211169-0a1dd7228f2d' },
];
const reviews = [
  ['Ananya R.', 'The loveliest little salon. I left feeling like myself, only a bit more polished.'],
  ['Meera S.', 'Such thoughtful colour advice and a genuinely relaxing afternoon. Already booked again.'],
  ['Priya K.', 'Warm people, beautiful space, and the best fringe I have ever had.']
];
const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '';
const waLink = (text) => `https://wa.me/${waNumber.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
const image = (id, width = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

function SalonHome() {
  const [selected, setSelected] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const chooseService = (id) => { setSelected(id); document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }); };
  return <div className="site-shell">
    {showSplash && <EntrySplash onFinish={() => setShowSplash(false)} />}
    <div className="announcement">A little time for yourself, in the heart of the neighbourhood <span>✳</span></div>
    <header className="site-header">
      <a className="brand" href="#home"><span className="brand-mark"><Scissors size={19}/></span><span>Velvet <i>& Vine</i><small>HAIR PARLOUR · EST. WITH CARE</small></span></a>
      <button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X/> : <Menu/>}</button>
      <nav className={mobileMenu ? 'nav-links open' : 'nav-links'}>
        <a href="#services" onClick={() => setMobileMenu(false)}>The menu</a><a href="#story" onClick={() => setMobileMenu(false)}>Our parlour</a><a href="#team" onClick={() => setMobileMenu(false)}>Our people</a><a href="#gallery" onClick={() => setMobileMenu(false)}>Gallery</a>
        <a className="nav-book" href="#booking" onClick={() => setMobileMenu(false)}>Book a chair <ArrowRight size={15}/></a>
      </nav>
    </header>
    <main>
      <section id="home" className="hero"><div className="hero-copy"><p className="eyebrow"><span/> A NEIGHBOURHOOD HAIR PARLOUR <span/></p><h1>Good hair.<br/><em>Good company.</em></h1><p className="hero-description">A thoughtful cut, a proper cup of tea, and a little time just for you. Pull up a chair — you’re in good hands.</p><div className="hero-actions"><a className="button button-dark" href="#booking">Find your appointment <ArrowRight size={16}/></a><a className="text-link" href="#services">Explore the menu <ArrowDown size={15}/></a></div><div className="hero-note"><div className="avatar-stack"><span>V</span><span>&</span><span>V</span></div><p><strong>Good hair days start here</strong><br/>Thoughtful hands, lovely people</p></div></div><div className="hero-image-wrap"><img className="hero-image" src={image('photo-1521590832167-7bcbfaa6381f', 1400)} alt="Warm, welcoming hair salon"/><div className="image-stamp"><span>✳</span><small>MAKE YOURSELF<br/>AT HOME</small></div><div className="hero-caption"><span>01 / 03</span><span>THE PARLOUR, ON A SLOW AFTERNOON</span></div></div></section>
      <section className="trust-strip"><div><Scissors/><p><strong>Considered cuts</strong><span>Made to feel like you</span></p></div><div><Clock3/><p><strong>Time to unwind</strong><span>No rushing, ever</span></p></div><div><MessageCircle/><p><strong>Easy enquiries</strong><span>We’re a WhatsApp away</span></p></div><div><MapPin/><p><strong>Right around here</strong><span>14 Rosewood Lane</span></p></div></section>
      <section id="services" className="section services-section"><div className="section-heading"><div><p className="eyebrow">A LITTLE SOMETHING FOR EVERYONE</p><h2>The service <em>menu</em></h2></div><p>Good hair begins with a good conversation. Here’s what we love doing — and what it costs.</p></div><div className="service-grid">{services.map((s, i) => <article className="service-card" key={s.id}><div className="service-card-top"><span className="service-number">{String(i + 1).padStart(2, '0')}</span><span className="service-category">{s.category}</span></div><h3>{s.name}</h3><p>{s.description}</p><div className="service-meta"><span><Clock3 size={14}/> {s.duration} min</span><strong>₹{s.price.toLocaleString('en-IN')}</strong></div><button type="button" className="service-book-btn" onClick={() => chooseService(s.id)}>Choose this service <ArrowRight size={15}/></button></article>)}</div><p className="service-footnote">Prices are a starting point. We’ll always talk through what’s right for your hair before we begin.</p></section>
      <section id="story" className="story-section"><div className="story-image"><img src={image('photo-1560066984-138dadb4c035', 1300)} alt="Stylist caring for a client's hair"/><span>THE GOOD OLD DAYS, EVERY DAY</span></div><div className="story-copy"><p className="eyebrow">A NOTE FROM THE PARLOUR</p><h2>A little corner<br/>to <em>feel at home.</em></h2><p>Velvet & Vine is a small, friendly salon built around a simple idea: when you feel looked after, you leave looking like yourself at your very best.</p><p>Come as you are. Stay for the tea. Leave with hair that feels like you.</p><div className="signature">With care, always<br/><strong>Your Velvet & Vine team</strong></div></div></section>
      <section id="team" className="section team-section"><div className="section-heading"><div><p className="eyebrow">GOOD PEOPLE, GOOD HANDS</p><h2>Meet your <em>stylists</em></h2></div><p>People who listen first, snip second — and make sure you leave feeling lovely.</p></div><div className="team-grid">{staff.map((person) => <article className="team-card" key={person.name}><img src={image(person.image, 700)} alt={person.name}/><div><span>{person.role}</span><h3>{person.name}</h3><p>{person.focus}</p></div></article>)}</div></section>
      <section id="gallery" className="section gallery-section"><div className="section-heading"><div><p className="eyebrow">A FEW FAVOURITE MOMENTS</p><h2>From our <em>chair</em></h2></div><p>A little peek at the people, hair, and happy afternoons that make our parlour.</p></div><div className="gallery-grid">{photos.map((src, i) => <figure key={src}><img src={src} alt={['Our welcoming salon', 'A stylist at work', 'A fresh style', 'A client portrait', 'Beautiful waves', 'A happy salon moment'][i]} loading="lazy"/></figure>)}</div></section>
      <BookingSection services={services} selectedInitialServiceId={selected}/>
      <section id="reviews" className="reviews-section"><div className="section-heading review-heading"><div><p className="eyebrow">KIND WORDS, FROM OUR CHAIRS</p><h2>It’s nice to <em>hear</em></h2></div><div className="rating-summary">★★★★★<small>A few notes from happy visits</small></div></div><div className="review-grid">{reviews.map(([name, quote]) => <article className="review-card" key={name}><div className="stars">★★★★★</div><blockquote>“{quote}”</blockquote><p className="review-author">{name}</p><small>Neighbourhood regular</small></article>)}</div></section>
      <section id="visit" className="visit-section"><div className="visit-copy"><p className="eyebrow">COME ON IN</p><h2>We’ll put<br/>the kettle <em>on.</em></h2><p>14 Rosewood Lane<br/>Tuesday – Saturday · 9:00 am – 5:00 pm</p><a className="button button-dark" href="https://maps.google.com/?q=14+Rosewood+Lane" target="_blank" rel="noreferrer">Get directions <ArrowRight size={16}/></a></div><iframe title="Map to Velvet and Vine salon" src="https://maps.google.com/maps?q=14%20Rosewood%20Lane&t=&z=14&ie=UTF8&iwloc=&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade"/></section>
      <a className="floating-whatsapp" href={waLink('Hi Velvet & Vine! I’d like to ask about an appointment.')} target="_blank" rel="noreferrer" aria-label="Message Velvet and Vine on WhatsApp"><MessageCircle size={21}/><span>Chat with us</span></a>
    </main>
    <footer className="site-footer"><div className="footer-main"><div><a className="brand footer-brand" href="#home"><span className="brand-mark"><Scissors size={19}/></span><span>Velvet <i>& Vine</i><small>HAIR PARLOUR · EST. WITH CARE</small></span></a><p>A good haircut and a little kindness<br/>never go out of style.</p></div><div className="footer-detail"><strong>Find us</strong><span>14 Rosewood Lane</span><a href="https://maps.google.com/?q=14+Rosewood+Lane" target="_blank" rel="noreferrer">Get directions <ArrowRight size={14}/></a><a href={waLink('Hi Velvet & Vine!')} target="_blank" rel="noreferrer"><MessageCircle size={15}/> WhatsApp us</a></div><div className="footer-detail"><strong>Salon hours</strong><span>Tuesday – Saturday</span><span>9:00 am – 5:00 pm</span><a href="#booking">Book a chair <ArrowRight size={14}/></a></div><div className="footer-detail"><strong>Follow along</strong><a href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram size={15}/> @velvetandvine</a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Velvet & Vine Hair Parlour</span><span>Made with care, and a little setting lotion.</span></div></footer>
  </div>;
}

export default function App() {
  return <LanguageProvider><SalonHome /></LanguageProvider>;
}
