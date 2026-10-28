import { createContext, useContext, useState, useEffect } from 'react';
import React from 'react';
const LanguageContext = createContext(null);

export const translations = {
  en: {
    // Navigation & Common
    parlourTitle: 'Velvet & Vine',
    parlourSub: 'HAIR PARLOUR · EST. 1987',
    announcement: 'A little time for yourself, beautifully spent ✳ Instant WhatsApp booking notifications ✳ Walk-ins welcome',
    menu: 'The menu',
    ourParlour: 'Our parlour',
    kindWords: 'Kind words',
    bookAChair: 'Book a chair',
    signInDemo: 'Sign In / Demo',
    myReservations: 'My Reservations',
    adminDashboard: 'Admin Dashboard',
    signOut: 'Sign out',
    enterParlour: 'Enter Parlour →',
    language: 'Language',

    // Hero Section
    heroEyebrow: 'A neighbourhood hair parlour',
    heroTitle1: 'Good hair.',
    heroTitle2: 'Good company.',
    heroDesc: 'A thoughtful cut, a proper cup of tea, and a little time that’s just for you. Come as you are; leave feeling like yourself, only more so. Reserve your chair with instant WhatsApp confirmations.',
    reserveVisit: 'Reserve your visit',
    exploreMenu: 'Explore the menu',
    heroNoteTitle: 'Small salon, lovely people',
    heroNoteSub: 'Thoughtful cuts since 1987 · WhatsApp enabled',

    // Trust strip
    trust1Title: 'Considered cuts',
    trust1Sub: 'Made for your real life',
    trust2Title: 'Slot Protected',
    trust2Sub: 'No double-bookings',
    trust3Title: 'WhatsApp Alerts',
    trust3Sub: 'Instant booking updates',
    trust4Title: '14 Rosewood Lane',
    trust4Sub: 'Come in, settle down',

    // Services
    servicesEyebrow: 'A little something for your hair',
    servicesTitle: 'The service',
    servicesTitleEm: 'menu',
    servicesDesc: 'Honest prices, unhurried appointments, and a stylist who listens. Choose what feels right; we can figure out the rest together.',
    chooseService: 'Choose this service',
    serviceFootnote: 'Not sure what to book? Choose The Signature Cut and leave us a note. We’ll help you find the right fit.',

    // Story
    storyEyebrow: 'A parlour with a point of view',
    storyTitle1: 'Come for the cut.',
    storyTitle2: 'Stay for the feeling.',
    storyP1: 'Velvet & Vine is a small, independent salon built around a simple idea: feeling looked after should be part of every appointment. We love a classic shape, a fresh start, and the kind of conversation that makes an hour fly by.',
    storyP2: 'Our stylists take the time to understand your hair, your routine, and what you want to feel when you leave. No fuss. No pressure. Just good work and a warm welcome.',
    storySign1: 'With love & a little hairspray,',
    storySign2: 'The Velvet & Vine crew',

    // Booking Section
    bookingEyebrow: 'Appointments',
    bookingTitle1: 'Reserve your chair with',
    bookingTitle2: 'quiet ease.',
    bookingDesc: 'Select your desired service, date, and time. Our system checks real-time slot availability to prevent double-booking, and sends immediate WhatsApp confirmation to both you and our parlour team.',
    instantWaNotice: 'Instant WhatsApp Notification',
    instantWaSub: 'You and the salon receive instant confirmation alerts with your booking summary.',
    dedicatedTime: 'Dedicated Chair Time',
    dedicatedSub: 'We never double-book or overlap styling appointments.',
    reservationDetails: 'Reservation Details',
    reservationSub: 'Fill in your details below to schedule your parlour visit',
    selectServiceLabel: 'Select Salon Service',
    chooseServicePlaceholder: '— Please choose a service —',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'e.g. Eleanor Vance',
    phoneLabel: 'WhatsApp Mobile',
    phonePlaceholder: '+1 555-0123',
    emailLabel: 'Email Address',
    optionalLabel: '(optional)',
    appointmentDateLabel: 'Appointment Date',
    availableSlotsLabel: 'Available Time Slots',
    checkingSlots: '(Checking slots...)',
    bookedPill: 'Booked',
    freePill: 'Free',
    slotNotice: 'Select a date to preview available parlour times',
    stylingNotesLabel: 'Special Styling Notes',
    stylingNotesPlaceholder: 'Let us know of any scalp sensitivities, previous color history, or inspirations.',
    confirmBookingBtn: 'Confirm Appointment & Send WhatsApp Alert',
    confirmingBooking: 'Confirming Reservation...',
    privacyNotice: '✦ Slot availability is strictly locked upon confirmation to prevent overlapping bookings.',
    bookingConfirmed: 'Booking Confirmed!',
    whatsappSentNotice: 'WhatsApp confirmation sent to',
    openInWhatsApp: 'Open in WhatsApp',

    // Messaging Between Admin and Client
    adminMessageBadge: 'Message from Salon Admin',
    newAdminMessage: 'New Message from Salon Admin!',
    replyOnWhatsApp: 'Reply on WhatsApp',
    sendMessageToClientBtn: 'Send Message to Client',
    adminComposerTitle: 'Dispatch Message to Client',
    adminComposerSub: 'Send appointment updates, reminders, or styling tips. Dispatches directly to client dashboard and WhatsApp.',
    quickTemplates: 'Quick Catchy Salon Templates:',
    template1: 'Chair Ready: Looking forward to welcoming you today!',
    template2: 'Please arrive 5 minutes early to enjoy our specialty herbal tea.',
    template3: 'Stylist Note: Feel free to bring hair inspiration photos.',
    template4: 'Special Parlour Offer: Enjoy 10% off our Restorative Treatment.',
    customMessagePlaceholder: 'Type custom message for client...',
    sendAndDispatchBtn: 'Send Message & Dispatch WhatsApp',
    sendingMessage: 'Dispatching...',
    markAsRead: 'Mark as Read',

    // Reviews Section
    reviewsEyebrow: 'Kind Words',
    reviewsTitle: 'Thoughts from the chair.',
    reviewsRatingBased: 'Based on verified parlour experiences',
    clientReflections: 'Client Reflections',
    leaveReviewHeading: 'Leave your review & rating',
    verifiedRequired: 'Verified Appointment Required',
    signInToReview: 'To maintain authenticity, only clients with a completed appointment booking can submit feedback. Please sign in or use Demo Client.',
    signInToLeaveFeedbackBtn: 'Sign In to Leave Feedback',
    noEligibleBookings: 'No Completed Bookings Pending Feedback',
    noEligibleDesc: 'Once you attend an appointment and it is marked completed by our parlour team, you will receive a WhatsApp reminder and your review form will unlock right here!',
    adminTipReview: 'Admin Tip: Switch to Admin Dashboard to mark an appointment as "Completed", which also triggers the WhatsApp feedback reminder!',
    chooseCompletedVisit: 'Choose your completed salon visit to review',
    yourRatingLabel: 'Your Star Rating ⭐',
    yourReviewLabel: 'Your Review & Styling Reflection',
    reviewPlaceholder: 'Describe the hospitality, the cut, the tea, and how you felt walking out of our parlour...',
    submitReviewBtn: 'Post Verified Review',
    submittingReview: 'Submitting Review...',

    // Loading Splash
    splashSubtitle: 'A neighbourhood salon for good hair and quiet company',
    splashPhrases: [
      'Brewing fresh parlour tea...',
      'Preparing your styling chair...',
      'Warming the fresh towels...',
      'Checking slot availability...',
      'Welcome to Velvet & Vine...',
    ],
  },

  ta: {
    // Navigation & Common
    parlourTitle: 'வெல்வெட் & வைன்',
    parlourSub: 'ஹேர் பார்லர் · நிறுவப்பட்டது 1987',
    announcement: 'உங்களுக்காக ஒரு இனிமையான நேரம் ✳ உடனடி வாட்ஸ்அப் முன்பதிவு அறிவிப்புகள் ✳ வரவேற்புடன் வரவேற்கிறோம்',
    menu: 'சேவைகள் பட்டியல்',
    ourParlour: 'எங்கள் பார்லர்',
    kindWords: 'வாடிக்கையாளர் கருத்துக்கள்',
    bookAChair: 'முன்பதிவு செய்க',
    signInDemo: 'உள்நுழைவு / டெமோ',
    myReservations: 'எனது முன்பதிவுகள்',
    adminDashboard: 'நிர்வாக பலகை',
    signOut: 'வெளியேறு',
    enterParlour: 'பார்லருக்குள் செல்க →',
    language: 'மொழி',

    // Hero Section
    heroEyebrow: 'உங்கள் அன்பான ஹேர் பார்லர்',
    heroTitle1: 'அழகான கூந்தல்.',
    heroTitle2: 'அன்பான வரவேற்பு.',
    heroDesc: 'உங்களுக்கான பிரத்யேக ஹேர்கட், சுவையான தேநீர் மற்றும் அமைதியான அழகிய நேரம். உங்கள் கூந்தல் அழகை மெருகூட்ட வாருங்கள். உடனடி வாட்ஸ்அப் உறுதிப்படுத்தலுடன் உங்கள் இருக்கையை முன்பதிவு செய்யுங்கள்.',
    reserveVisit: 'இப்போதே முன்பதிவு செய்க',
    exploreMenu: 'சேவைகளைப் பார்க்க',
    heroNoteTitle: 'அன்பான மனிதர்கள், சிறந்த சேவை',
    heroNoteSub: '1987 முதல் தரமான ஹேர்கட் · வாட்ஸ்அப் வசதியுடன்',

    // Trust strip
    trust1Title: 'சிறந்த ஹேர்கட்',
    trust1Sub: 'உங்கள் வாழ்க்கை முறைக்கேற்ப',
    trust2Title: 'நேரப் பாதுகாப்பு',
    trust2Sub: 'இரட்டைப் பதிவு கிடையாது',
    trust3Title: 'வாட்ஸ்அப் தகவல்',
    trust3Sub: 'உடனடி பதிவு அறிவிப்புகள்',
    trust4Title: '14 ரோஸ்வுட் லேன்',
    trust4Sub: 'நேரில் வந்து மகிழுங்கள்',

    // Services
    servicesEyebrow: 'உங்கள் கூந்தலுக்கான சிறப்புகள்',
    servicesTitle: 'சேவைகள்',
    servicesTitleEm: 'பட்டியல்',
    servicesDesc: 'நேர்மையான கட்டணம், அவசரமில்லாத கவனிப்பு, உங்கள் விருப்பத்தைக் கேட்கும் நிபுணர்கள். உங்களுக்குப் பிடித்ததைத் தேர்ந்தெடுங்கள்.',
    chooseService: 'இந்த சேவையைத் தேர்ந்தெடுக்க',
    serviceFootnote: 'எதை தேர்ந்தெடுப்பது என்று தெரியவில்லையா? சிக்னேச்சர் கட் தேர்வு செய்து குறிப்பு கொடுங்கள்; நாங்கள் உங்களுக்கு உதவுவோம்.',

    // Story
    storyEyebrow: 'பாரம்பரியமும் அழகும்',
    storyTitle1: 'அழகான ஹேர்கட்டுக்கு வாருங்கள்.',
    storyTitle2: 'மகிழ்ச்சியுடன் செல்லுங்கள்.',
    storyP1: 'வெல்வெட் & வைன் ஒரு தனித்துவமான பார்லர். ஒவ்வொரு சந்திப்பிலும் நீங்கள் நன்கு கவனிக்கப்பட வேண்டும் என்பதே எங்கள் நோக்கம். நேர்த்தியான ஹேர்கட் மற்றும் இனிமையான உரையாடலை நாங்கள் விரும்புகிறோம்.',
    storyP2: 'எங்கள் சிகையலங்கார வல்லுநர்கள் உங்கள் விருப்பத்தைப் புரிந்துகொண்டு பணிபுரிகிறார்கள். எவ்வித அவசரமும் இன்றி அன்பான வரவேற்பு காத்திருக்கிறது.',
    storySign1: 'அன்புடன்,',
    storySign2: 'வெல்வெட் & வைன் குழுவினர்',

    // Booking Section
    bookingEyebrow: 'முன்பதிவுகள்',
    bookingTitle1: 'எளிதாக உங்கள் இருக்கையை',
    bookingTitle2: 'முன்பதிவு செய்யுங்கள்.',
    bookingDesc: 'விரும்பிய சேவை, தேதி மற்றும் நேரத்தைத் தேர்வுசெய்யவும். எங்களின் நிகழ்நேர அமைப்பு இரட்டைப் பதிவைத் தடுத்து, உங்களுக்கும் நிர்வாகிக்கும் உடனடி வாட்ஸ்அப் தகவலை அனுப்புகிறது.',
    instantWaNotice: 'உடனடி வாட்ஸ்அப் அறிவிப்பு',
    instantWaSub: 'உங்களுக்கும் பார்லருக்கும் முழு விவரங்களுடன் உடனடி உறுதிப்படுத்தல் செய்தி வரும்.',
    dedicatedTime: 'தனிப்பட்ட நேரம்',
    dedicatedSub: 'ஒரே நேரத்தில் இருவருக்கு ஒரே நேரம் ஒதுக்கப்பட மாட்டாது.',
    reservationDetails: 'முன்பதிவு விவரங்கள்',
    reservationSub: 'உங்கள் பார்லர் வருகையை திட்டமிட கீழே உள்ள விவரங்களை நிரப்பவும்',
    selectServiceLabel: 'சேவையைத் தேர்ந்தெடுக்கவும்',
    chooseServicePlaceholder: '— சேவையைத் தேர்ந்தெடுக்கவும் —',
    fullNameLabel: 'முழு பெயர்',
    fullNamePlaceholder: 'எ.கா. அகிலா',
    phoneLabel: 'வாட்ஸ்அப் மொபைல் எண்',
    phonePlaceholder: '+91 9876543210',
    emailLabel: 'மின்னஞ்சல் முகவரி',
    optionalLabel: '(விருப்பத்தேர்வு)',
    appointmentDateLabel: 'முன்பதிவு தேதி',
    availableSlotsLabel: 'கிடைக்கும் நேரங்கள்',
    checkingSlots: '(நேரங்களைச் சரிபார்க்கிறது...)',
    bookedPill: 'பதிவாகியது',
    freePill: 'கிடைக்கும்',
    slotNotice: 'கிடைக்கும் நேரங்களைப் பார்க்க ஒரு தேதியைத் தேர்ந்தெடுக்கவும்',
    stylingNotesLabel: 'கூடுதல் குறிப்புகள்',
    stylingNotesPlaceholder: 'உங்கள் விருப்பங்கள் அல்லது தேவைகளைக் குறிப்பிடவும்.',
    confirmBookingBtn: 'முன்பதிவை உறுதிசெய்து வாட்ஸ்அப் செய்தி பெறுக',
    confirmingBooking: 'முன்பதிவு செய்யப்படுகிறது...',
    privacyNotice: '✦ முன்பதிவு செய்தவுடன் அந்த நேரம் உடனடியாகப் பூட்டப்படும்.',
    bookingConfirmed: 'முன்பதிவு வெற்றிகரமாக முடிந்தது!',
    whatsappSentNotice: 'வாட்ஸ்அப் உறுதிப்படுத்தல் அனுப்பப்பட்டது:',
    openInWhatsApp: 'வாட்ஸ்அப்பில் பார்க்க',

    // Messaging Between Admin and Client
    adminMessageBadge: 'பார்லர் நிர்வாகியின் செய்தி',
    newAdminMessage: 'நிர்வாகியிடமிருந்து புதிய செய்தி!',
    replyOnWhatsApp: 'வாட்ஸ்அப்பில் பதிலளிக்கவும்',
    sendMessageToClientBtn: 'வாடிக்கையாளருக்கு செய்தி அனுப்புக',
    adminComposerTitle: 'வாடிக்கையாளருக்கு செய்தி அனுப்பவும்',
    adminComposerSub: 'முன்பதிவு மாற்றங்கள், நினைவூட்டல் மற்றும் குறிப்புகளை வாடிக்கையாளர் பலகைக்கும் வாட்ஸ்அப்பிற்கும் அனுப்புங்கள்.',
    quickTemplates: 'விரைவான மாதிரி செய்திகள்:',
    template1: 'உங்கள் இருக்கை தயார்: உங்களை வரவேற்க ஆவலுடன் காத்திருக்கிறோம்!',
    template2: 'தயவுசெய்து 5 நிமிடங்கள் முன்னதாக வந்து மூலிகை தேநீரை ருசியுங்கள்.',
    template3: 'சிகையலங்கார குறிப்பு: உங்களுக்குப் பிடித்த புகைப்படங்களை எடுத்து வரலாம்.',
    template4: 'சிறப்புச் சலுகை: இன்றைய சேவையில் 10% சிறப்பு தள்ளுபடி பெறுங்கள்.',
    customMessagePlaceholder: 'வாடிக்கையாளருக்கான தனிப்பயன் செய்தியை எழுதவும்...',
    sendAndDispatchBtn: 'செய்தியை அனுப்பி வாட்ஸ்அப்பில் சேர்ப்பிக்கவும்',
    sendingMessage: 'அனுப்பப்படுகிறது...',
    markAsRead: 'படித்ததாகக் குறிக்கவும்',

    // Reviews Section
    reviewsEyebrow: 'வாடிக்கையாளர் கருத்துக்கள்',
    reviewsTitle: 'இருக்கையில் அமர்ந்தோரின் அனுபவங்கள்.',
    reviewsRatingBased: 'உறுதிப்படுத்தப்பட்ட பார்லர் வருகைகளின் அடிப்படையில்',
    clientReflections: 'வாடிக்கையாளர் அனுபவம்',
    leaveReviewHeading: 'உங்கள் மதிப்பீடு & கருத்தைப் பகிரவும்',
    verifiedRequired: 'நிறைவுசெய்த முன்பதிவு அவசியம்',
    signInToReview: 'உண்மையான கருத்துக்களை உறுதிப்படுத்த, வருகை நிறைவுசெய்த வாடிக்கையாளர்கள் மட்டுமே கருத்து தெரிவிக்க முடியும்.',
    signInToLeaveFeedbackBtn: 'கருத்து தெரிவிக்க உள்நுழையவும்',
    noEligibleBookings: 'மதிப்பீட்டிற்கு காத்திருக்கும் பதிவுகள் ஏதுமில்லை',
    noEligibleDesc: 'உங்கள் சந்திப்பு நிறைவடைந்தவுடன் வாட்ஸ்அப் நினைவூட்டல் வரும், அப்போது கருத்து தெரிவிக்கலாம்!',
    adminTipReview: 'நிர்வாகக் குறிப்பு: முன்பதிவை "Completed" என மாற்றினால் தானாக வாட்ஸ்அப் நினைவூட்டல் செல்லும்!',
    chooseCompletedVisit: 'நிறைவுசெய்த வருகையைத் தேர்ந்தெடுக்கவும்',
    yourRatingLabel: 'உங்கள் மதிப்பீடு ⭐',
    yourReviewLabel: 'உங்கள் அனுபவக் குறிப்பு',
    reviewPlaceholder: 'பார்லரின் வரவேற்பு, ஹேர்கட் தரம் மற்றும் உங்கள் அனுபவத்தைப் பற்றி எழுதுங்கள்...',
    submitReviewBtn: 'மதிப்பீட்டைப் பதிவிடவும்',
    submittingReview: 'பதிவிடப்படுகிறது...',

    // Loading Splash
    splashSubtitle: 'அழகான கூந்தல் மற்றும் அமைதியான சூழலுக்கான பிரத்யேக பார்லர்',
    splashPhrases: [
      'சுவையான பார்லர் தேநீர் தயாராகிறது...',
      'உங்கள் இருக்கை அலங்கரிக்கப்படுகிறது...',
      'சூடான டவல்கள் தயாராகின்றன...',
      'கிடைக்கும் நேரங்கள் சரிபார்க்கப்படுகின்றன...',
      'வெல்வெட் & வைனுக்கு நல்வரவு...',
    ],
  },
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('vv_lang') || 'en';
  });

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('vv_lang', newLang);
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

