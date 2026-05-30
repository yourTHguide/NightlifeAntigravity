import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/concierge.module.css';
import { motion, AnimatePresence } from 'framer-motion';

export default function BestNightlifeConcierge() {
  const [activeTab, setActiveTab] = useState('concierge');
  const [activeModal, setActiveModal] = useState(null);
  const [activePreviewDetail, setActivePreviewDetail] = useState(null);
  const [activePrivateDetail, setActivePrivateDetail] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeBanner, setActiveBanner] = useState(0);

  const PREVIEW_DATA = {
    'Sing Sing Theater': {
      title: 'Sing Sing Theater',
      label: 'PARTNER VENUE',
      pills: ['Solo Friendly', 'Mixed Crowd', 'Table Service', 'Thonglor', '20+'],
      desc: "One of Bangkok's most visually stunning clubs — theatrical interiors, eclectic music, and a crowd that actually knows how to have a good time. We handle your table and entry.",
      ctaText: 'Reserve via BEST →',
      type: 'venue',
      images: ['/assets/images/Singsing%20shot.jpeg', '/assets/images/Singsing%20shot.jpeg', '/assets/images/Singsing%20shot.jpeg', '/assets/images/Singsing%20shot.jpeg']
    },
    'Levels Club & Lounge': {
      title: 'Levels Club & Lounge',
      label: 'PARTNER VENUE',
      pills: ['5–15+ People', 'EDM / Hip-Hop', 'Multi-Floor', 'Sukhumvit Soi 11', '20+'],
      desc: "Bangkok's iconic multi-floor superclub on Soi 11. Hip-hop, EDM, R&B, and an international crowd every night. Best for groups who want energy and variety.",
      ctaText: 'Reserve via BEST →',
      type: 'venue',
      images: ['/assets/images/Chupa.jpg', '/assets/images/Chupa.jpg', '/assets/images/Chupa.jpg', '/assets/images/Chupa.jpg']
    },
    'Onyx Bangkok': {
      title: 'Onyx Bangkok',
      label: 'PARTNER VENUE',
      pills: ['Music Lovers', 'World-Class DJs', 'RCA District', 'Production Nights', '20+'],
      desc: "World-class sound production and serious DJ bookings. If you care about the music, this is your night. We arrange access and table placement.",
      ctaText: 'Reserve via BEST →',
      type: 'venue',
      images: ['/assets/images/Lamaya.png', '/assets/images/Lamaya.png', '/assets/images/Lamaya.png', '/assets/images/Lamaya.png']
    },
    'Sugar Bangkok': {
      title: 'Sugar Bangkok',
      label: 'PARTNER VENUE',
      pills: ['Couples Friendly', 'Rooftop Views', 'Social Crowd', 'Sukhumvit Soi 11', '20+'],
      desc: "Relaxed premium energy with a rooftop view. Great for couples, smaller groups, or anyone who wants a polished night without full-on club intensity.",
      ctaText: 'Reserve via BEST →',
      type: 'venue',
      images: ['/assets/images/Singsing%20shot.jpeg', '/assets/images/Singsing%20shot.jpeg', '/assets/images/Singsing%20shot.jpeg', '/assets/images/Singsing%20shot.jpeg']
    },
    'Bangkok Singles Event': {
      title: 'Bangkok Singles Event',
      label: 'THIS WEEK',
      pills: ['Solo Friendly', 'Singles Welcome', 'Meet New People', 'This Saturday', 'Limited Spots'],
      desc: "A curated social night for solo travelers and Bangkok locals — good people, great venues, hosted by BEST. No awkward mixers. Just a real night out.",
      ctaText: 'Join This Night →',
      type: 'event',
      images: ['/assets/images/Events/Single%20Meet%20Club.jpg', '/assets/images/Events/Single%20Meet%20Club.jpg', '/assets/images/Events/Single%20Meet%20Club.jpg', '/assets/images/Events/Single%20Meet%20Club.jpg']
    },
    'Bangkok Club Crawl': {
      title: 'Bangkok Club Crawl',
      label: 'OUR FLAGSHIP EXPERIENCE',
      pills: ['Every Week', '4 Premium Venues', 'Hosted Night', 'Solo & Groups', '9:30 PM Start'],
      desc: "Bangkok's best weekly club crawl — 4 curated venues, local hosts, party van with music and lights, and VIP entry all night. The easiest way to experience Bangkok nightlife done right.",
      ctaText: 'Visit bkkclubcrawl.com →',
      type: 'event',
      url: 'https://bkkclubcrawl.com',
      images: ['/assets/images/club-crawl.jpg', '/assets/images/club-crawl.jpg', '/assets/images/club-crawl.jpg', '/assets/images/club-crawl.jpg']
    }
  };

  const openPreview = (id) => {
    setSelectedIndex(0);
    setActivePreviewDetail(PREVIEW_DATA[id]);
  };

  const [cards, setCards] = useState([
    { id: 1, title: 'Yacht Party — Pattaya', label: 'LUXURY', img: '/assets/images/Yacht%20Party.jpg', price: 'From 3,000 THB / person', includes: ['Private yacht charter (4 hours)', 'Professional crew and licensed captain', 'Sound system + curated playlist', 'Soft drinks package onboard', 'Event host and full coordination'], pills: ['10–30 People', 'Pattaya Coastline', 'Private Charter', 'Sunset to Night', 'Drinks Upgrade Available'], ctaText: 'Request This Experience →', priceOnInquiry: false },
    { id: 2, title: 'Pool Villa Party', label: 'OUTDOOR PRODUCTION', img: '/assets/images/pool-villa.jpg', price: 'From 4,800 THB / person', includes: ['Private pool villa sourcing & coordination', 'DJ (2–3 hours)', 'Full outdoor sound system + party lighting', 'Event host — 2 hosts for groups of 16+', 'Setup and breakdown coordination'], pills: ['10–50 People', 'Private Pool', 'DJ Included', 'BKK Outskirts & Pattaya', 'Outdoor Party'], ctaText: 'Request This Experience →', priceOnInquiry: false },
    { id: 3, title: 'Penthouse & Condo Party', label: 'PRIVATE PRODUCTION', img: '/assets/images/Villa%20Party.jpg', price: 'From 25,000 THB flat', includes: ['DJ (3 hours)', 'Professional sound system + party lighting', 'Event host for logistics and atmosphere', 'Full setup and breakdown coordination', 'Pre-event supplier briefing'], pills: ['Bangkok City', 'Your Space', 'DJ Included', 'Skyline Views', 'Flat Fee'], ctaText: 'Request This Experience →', priceOnInquiry: false },
    { id: 4, title: 'Proposal Night', label: 'ULTRA-PREMIUM', img: '/assets/images/Singsing%20shot.jpeg', price: 'From 20,000 THB flat', includes: ['VIP table at premium rooftop or cocktail bar', 'Senior host (Guide-level, non-negotiable)', 'Champagne — 1 bottle, purchased by BEST', 'Flower arrangement at table', 'Professional photographer — 2–3 hrs, positioned discreetly'], pills: ['The Proposal', 'Photographer Included', 'Champagne Included', 'Every Detail Planned', 'Once in a Lifetime'], ctaText: 'Request This Experience →', priceOnInquiry: false },
    { id: 5, title: 'Anniversary Night', label: 'ROMANTIC', img: '/assets/images/Singsing%20shot.jpeg', price: 'From 10,000 THB flat (2 pax)', includes: ['Premium table reservation at any venue (BEST coordinates)', 'Personal host — present or on-call, your choice', 'Welcome cocktails for the couple', 'Flower arrangement delivered to table before you arrive', 'Full pre-night coordination & venue staff briefing'], pills: ['Anniversary', 'Couples', 'Flowers Included', 'Any Venue', 'Flexible Start'], ctaText: 'Request This Experience →', priceOnInquiry: false },
    { id: 6, title: 'Bachelor Night Out', label: 'STAG NIGHT', img: '/assets/images/club-crawl.jpg', price: 'From 2,000 THB / person', includes: ['3 high-energy venue itinerary', 'Dedicated host for the full night', 'VIP entry at all venues', 'Private party van with music & lights', 'Welcome shots round + groom prop kit'], pills: ['Stag Night', '6–20 People', '3 Venues', 'Party Van', 'VIP Entry'], ctaText: 'Request This Experience →', priceOnInquiry: false },
    { id: 7, title: 'Bachelorette Night', label: 'HEN PARTY', img: '/assets/images/hen-party.jpg', price: 'From 2,000 THB / person', includes: ['Female-friendly curated venue itinerary', 'Dedicated host for the full night', 'VIP entry at all venues', 'Private party van with music & lights', 'Welcome shots round + hen prop kit (sash, veil, badges)'], pills: ['Bachelorette', '6–20 People', 'Prop Kit Included', 'VIP Entry', 'Girls Night'], ctaText: 'Request This Experience →', priceOnInquiry: false },
    { id: 8, title: 'Birthday Night Out', label: 'CELEBRATION', img: '/assets/images/Villa%20Party.jpg', price: 'From 2,000 THB / person', includes: ['Custom 2–3 venue itinerary', 'Dedicated host for the full night', 'VIP entry at all venues', 'Private party van with music & lights', 'Welcome shots round + birthday surprise coordination'], pills: ['Birthday', '6–20 People', 'Host Included', 'VIP Entry', 'Surprise Ready'], ctaText: 'Request This Experience →', priceOnInquiry: false },
    { id: 9, title: 'Private Club Crawl', label: 'PRIVATE GROUP', img: '/assets/images/club-crawl.jpg', price: 'From 1,500 THB / person', includes: ['Custom 3–4 venue itinerary', 'Dedicated private host for the full night', 'Private party van with music & lights', 'VIP entry at all venues', 'Welcome shots round for the group'], pills: ['Private Group', '8–20 People', '3–4 Venues', 'Private Van', 'VIP Entry'], ctaText: 'Request This Experience →', priceOnInquiry: false },
    { id: 10, title: 'VIP Table & Bottle Service', label: 'VIP CONCIERGE', img: '/assets/images/vip-table.jpg', price: '2,000 THB BEST fee', includes: ['VIP table reservation at chosen partner venue', 'Welcome perks negotiated on your behalf', 'Guest list priority & skip-the-line access', 'Personal WhatsApp concierge before and during the night', 'On-call coordination throughout the evening'], pills: ['2–15 People', 'VIP Table', 'Personal Butler', 'Skip The Line', 'Venue Min. 20k+'], ctaText: 'Reserve Your Table →', priceOnInquiry: true },
    { id: 11, title: 'Corporate Team Night', label: 'CORPORATE', img: '/assets/images/club-crawl.jpg', price: 'From 1,800 THB / person', includes: ['Custom 2–3 venue itinerary for professional groups', 'Dedicated host throughout the night', 'VIP entry at all venues', 'Private transport between venues', 'Welcome drinks (1 round per person)'], pills: ['10–50 People', 'Corporate', 'Team Building', 'Receipt Available', 'VIP Entry'], ctaText: 'Request This Experience →', priceOnInquiry: false },
    { id: 12, title: 'Rooftop Private Buyout', label: 'PREMIUM EVENT', img: '/assets/images/Singsing%20shot.jpeg', price: 'From 10,000 THB coordination fee', includes: ['Venue sourcing and negotiation', 'Full event coordination and run of show', 'On-site host and supplier management', 'Guest list and arrival management'], pills: ['20–100 People', 'Full Buyout', 'City Views', 'Custom Quote', 'Corporate & Events'], ctaText: 'Request a Proposal →', priceOnInquiry: true },
    { id: 13, title: 'Brand & Influencer Event', label: 'BRAND & PRODUCTION', img: '/assets/images/Yacht%20Party.jpg', price: 'From 30,000 THB total', includes: ['Access to Bangkok\'s best partner venues', 'Built-in audience (Flow Lab + BEST guest database)', 'Content-ready nightlife production', 'Host network and on-ground event management', 'Cross-promotion through BEST social channels'], pills: ['Brands & Agencies', 'Venue Buyout', 'Content Creation', 'Launch Events', 'Built-in Audience'], ctaText: 'Request a Proposal →', priceOnInquiry: true }
  ]);

  const swipeCard = () => {
    setCards((prev) => {
      const newCards = [...prev];
      const frontCard = newCards.shift();
      newCards.push(frontCard);
      return newCards;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev === 0 ? 1 : 0));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    date: '',
    groupSize: '',
    budgetRange: '',
    occasion: '',
    preferredVibe: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/vip-inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          inquiryType: type,
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setActiveModal(null);
          setSubmitSuccess(false);
          setFormData({ name: '', whatsapp: '', date: '', groupSize: '', budgetRange: '', occasion: '', preferredVibe: '' });
        }, 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Failed to submit inquiry. Please double check your details and try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.conciergeApp}>
      <Head>
        <title>Concierge - BEST Nightlife Thailand</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700&family=Poppins:wght@600&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        html, body {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          background-color: #080808;
        }
      `}</style>

      {/* ANIMATED BACKGROUND */}
      <div className={styles.animatedBg}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
        <div className={styles.blob3}></div>
      </div>

      <header className={styles.header}>
        <img src="/assets/logo/BEST%20Nightlife%20Thailand%20LOGO.png" alt="BEST Nightlife Logo" className={styles.headerLogo} />
        <h1><span className={styles.goldText}>BEST</span> <span style={{ fontWeight: 300, color: '#FFFFFF' }}>NIGHTLIFE THAILAND</span></h1>
      </header>

      {activeTab === 'concierge' && (
        <div className={styles.eventsSection}>
          <h2 className={styles.sectionTitle}>Our <span style={{ color: '#FF2D78' }}>Events</span></h2>
          <div className={styles.bannerWrapper}>
            <div 
              onClick={() => openPreview('Bangkok Club Crawl')}
              className={`${styles.crawlHero} ${activeBanner === 0 ? styles.activeBanner : ''}`} 
              style={{ backgroundImage: `url('/assets/images/club-crawl.jpg')`, cursor: 'pointer' }}
            ></div>
            <div 
              onClick={() => openPreview('Bangkok Singles Event')}
              className={`${styles.crawlHero} ${activeBanner === 1 ? styles.activeBanner : ''}`} 
              style={{ backgroundImage: `url('/assets/images/Events/Single%20Meet%20Club.jpg')`, cursor: 'pointer' }}
            ></div>
            <div className={styles.bannerDots}>
              <span className={`${styles.dot} ${activeBanner === 0 ? styles.activeDot : ''}`} onClick={() => setActiveBanner(0)}></span>
              <span className={`${styles.dot} ${activeBanner === 1 ? styles.activeDot : ''}`} onClick={() => setActiveBanner(1)}></span>
            </div>
          </div>
          <p className={styles.hostedBy}>Hosted by BEST Nightlife Thailand</p>
        </div>
      )}

      <div className={styles.tabsContainer}>
        <div className={styles.pillTabs}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'concierge' ? styles.tabBtnActiveVenues : ''}`}
            onClick={() => setActiveTab('concierge')}
          >
            Venues
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'private' ? styles.tabBtnActivePrivate : ''}`}
            onClick={() => setActiveTab('private')}
          >
            VIP Private
          </button>
        </div>
      </div>

      <main>
        {activeTab === 'concierge' && (
          <div className="fade-in">
            <section className={styles.heroSection}>
              <h2 className={styles.heroTitle}>Our Partner Venues</h2>
              <p className={styles.heroSubtitle}>BEST-approved spots. We handle the reservation — you just show up.</p>
            </section>

            <section className={styles.venueCarousel}>
              {Array(30).fill([
                { name: 'Sing Sing Theater', area: 'Thonglor, Sukhumvit 45', img: '/assets/images/Singsing%20shot.jpeg' },
                { name: 'Levels Club & Lounge', area: 'Sukhumvit Soi 11', img: '/assets/images/Chupa.jpg' },
                { name: 'Onyx Bangkok', area: 'RCA Entertainment District', img: '/assets/images/Lamaya.png' },
                { name: 'Sugar Bangkok', area: 'Sukhumvit Soi 11', img: '/assets/images/Singsing%20shot.jpeg' }
              ]).flat().map((venue, idx) => (
                <div key={idx} className={styles.venueCard} onClick={() => openPreview(venue.name)}>
                  <div className={styles.venueImg} style={{ backgroundImage: `url('${venue.img}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                  <div className={styles.venueTextContainer}>
                    <h3 className={styles.venueName}>{venue.name}</h3>
                    <p className={styles.venueArea}>{venue.area}</p>
                    <span className={styles.venueCta}>Reserve via BEST →</span>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {activeTab === 'private' && (
          <motion.div 
            className="fade-in"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px' }}
          >
            <section className={styles.heroSectionPrivate}>
              <h2 className={styles.heroTitlePrivate}>
                Create Your <span className={styles.staticGoldText}>Night</span> With Our <span className={styles.staticGoldText}>Expertise</span>
              </h2>
              <p className={styles.heroSubtitlePrivate}>
                Private groups, celebrations, and luxury experiences — fully designed around you.
              </p>
            </section>
            <div className={styles.stackContainer}>
              <AnimatePresence>
                {cards.slice(0, 3).map((card, idx) => {
                  const isFront = idx === 0;
                  return (
                    <motion.div
                      key={card.id}
                      className={styles.stackCard}
                      onClick={() => isFront ? setActivePrivateDetail(card) : swipeCard()}
                      drag={isFront ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(e, { offset, velocity }) => {
                        const swipe = Math.abs(offset.x) * velocity.x;
                        if (swipe < -10000 || swipe > 10000 || Math.abs(offset.x) > 50) {
                          swipeCard();
                        }
                      }}
                      initial={{ opacity: 0, y: -50, scale: 0.9 }}
                      animate={{
                        opacity: 1,
                        y: idx * 24,
                        scale: 1 - idx * 0.05,
                        zIndex: cards.length - idx
                      }}
                      exit={{ opacity: 0, x: -200, transition: { duration: 0.2 } }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: idx * 0.08 }}
                      style={{
                        backgroundImage: `url('${card.img}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      <div className={styles.stackCardGradient}></div>
                      <div className={styles.stackCardContent}>
                        <p className={styles.stackCardLabel}>{card.label}</p>
                        <h3 className={styles.stackCardTitle}>{card.title}</h3>
                        <p className={styles.stackCardPrice}>{card.price}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </main>

      {/* FULL SCREEN PREVIEW MODAL */}
      <AnimatePresence>
        {activePreviewDetail && (
          <motion.div
            className={styles.previewModalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setActivePreviewDetail(null)}
          >
            <motion.div
              className={`${styles.previewModalContent} ${
                activePreviewDetail.type === 'vip' ? styles.previewModalVIP : styles.previewModalVenue
              }`}
              style={{ WebkitOverflowScrolling: 'touch' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200, duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.y > 100 || velocity.y > 500) {
                  setActivePreviewDetail(null);
                }
              }}
            >
              {/* HEADER IMAGE */}
              <div 
                className={styles.previewHeaderImg} 
                style={{ backgroundImage: `url('${activePreviewDetail.images[selectedIndex]}')` }}
              >
                <div className={styles.previewHeaderGradient}></div>
                <button className={styles.previewCloseBtn} onClick={() => setActivePreviewDetail(null)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L13 13M1 13L13 1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* THUMBNAIL ROW */}
              <div className={styles.previewThumbnails}>
                {activePreviewDetail.images.map((img, idx) => (
                  <div 
                    key={idx}
                    className={`${styles.previewThumb} ${idx === selectedIndex ? styles.previewThumbSelected : ''}`}
                    style={{ backgroundImage: `url('${img}')` }}
                    onClick={() => setSelectedIndex(idx)}
                  ></div>
                ))}
              </div>

              {/* CONTENT AREA */}
              <div className={styles.previewBody}>
                <p className={styles.previewLabel}>{activePreviewDetail.label}</p>
                <h2 className={styles.previewTitle}>{activePreviewDetail.title}</h2>
                
                <div className={styles.previewPills}>
                  {activePreviewDetail.pills.map((pill, idx) => (
                    <span key={idx} className={styles.previewPill}>{pill}</span>
                  ))}
                </div>

                <p className={styles.previewDesc}>{activePreviewDetail.desc}</p>

                <div className={styles.previewCtaWrapper}>
                  <button 
                    className={activePreviewDetail.type === 'vip' ? styles.previewCtaBtnGold : styles.previewCtaBtnPink}
                    onClick={() => {
                      if (activePreviewDetail.url) {
                        window.open(activePreviewDetail.url, '_blank');
                      } else {
                        setActivePreviewDetail(null);
                        if (activePreviewDetail.type === 'vip') setActiveModal('private');
                        else setActiveModal('table');
                      }
                    }}
                  >
                    <span>
                      {activePreviewDetail.ctaText}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIP BOTTOM SHEET */}
      <AnimatePresence>
        {activePrivateDetail && (
          <motion.div 
            className={styles.sheetBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePrivateDetail(null)}
          >
            <motion.div 
              className={styles.sheetContent}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.y > 100 || velocity.y > 500) {
                  setActivePrivateDetail(null);
                }
              }}
            >
              <div className={styles.sheetHandle}></div>
              <p className={styles.sheetLabel}>{activePrivateDetail.label}</p>
              <h2 className={styles.sheetTitle}>{activePrivateDetail.title}</h2>
              <div className={styles.sheetDivider}></div>
              <ul className={styles.sheetIncludes}>
                {activePrivateDetail.includes.map((item, i) => (
                  <li key={i}><span style={{ color: '#C9A84C' }}>—</span> {item}</li>
                ))}
              </ul>
              {activePrivateDetail.priceOnInquiry ? (
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                  Pricing on inquiry — submit your details and we'll send a custom proposal within 4 hours.
                </p>
              ) : (
                <>
                  <p className={styles.sheetPriceLabel}>STARTING FROM</p>
                  <p className={styles.sheetPrice}>{activePrivateDetail.price}</p>
                </>
              )}
              <button 
                className={styles.sheetCta}
                onClick={() => {
                  setActivePrivateDetail(null);
                  setActiveModal('private');
                }}
              >
                {activePrivateDetail.ctaText}
              </button>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '12px', fontFamily: "'Montserrat', sans-serif" }}>
                Exact pricing confirmed after inquiry — no surprises.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TABLE REQUEST MODAL */}
      {activeModal === 'table' && (
        <div className={styles.modalBackdrop} onClick={() => setActiveModal(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Reserve Your Spot</h3>
              <button className={styles.modalClose} onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            
            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <h3 style={{ color: 'var(--accent-gold)' }}>Request Received</h3>
                <p style={{ color: 'var(--text-muted)' }}>You're on our radar. Expect a WhatsApp reply from the BEST team within 2 hours.</p>
              </div>
            ) : (
              <form onSubmit={(e) => handleSubmit(e, 'VIP Potential')}>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px', lineHeight: '1.4' }}>
                  We'll confirm directly with the venue and send a WhatsApp reply — usually within 2 hours. Payment secured via link.
                </p>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Name</label>
                  <input required type="text" name="name" className={styles.formInput} value={formData.name} onChange={handleInputChange} placeholder="Your full name" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>WhatsApp Number</label>
                  <input required type="tel" name="whatsapp" className={styles.formInput} value={formData.whatsapp} onChange={handleInputChange} placeholder="+1234567890" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Date</label>
                  <input required type="date" name="date" className={styles.formInput} value={formData.date} onChange={handleInputChange} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Group Size</label>
                  <select required name="groupSize" className={styles.formSelect} value={formData.groupSize} onChange={handleInputChange}>
                    <option value="">Select size</option>
                    <option value="1-3">1-3 People</option>
                    <option value="4-6">4-6 People</option>
                    <option value="7-10">7-10 People</option>
                    <option value="10+">10+ People</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Budget Range (THB)</label>
                  <select required name="budgetRange" className={styles.formSelect} value={formData.budgetRange} onChange={handleInputChange}>
                    <option value="">Select budget</option>
                    <option value="10k-20k">10,000 - 20,000 THB</option>
                    <option value="20k-50k">20,000 - 50,000 THB</option>
                    <option value="50k+">50,000+ THB</option>
                  </select>
                </div>
                
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : '⭐ Request Reservation — We\'ll WhatsApp You'}
                </button>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>
                  Commission-free for guests. We earn from venue spend.
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* PRIVATE INQUIRY MODAL */}
      {activeModal === 'private' && (
        <div className={styles.modalBackdrop} onClick={() => setActiveModal(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Tell Us About Your Night</h3>
              <button className={styles.modalClose} onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            
            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <h3 style={{ color: 'var(--accent-gold)' }}>Inquiry Received</h3>
                <p style={{ color: 'var(--text-muted)' }}>Proposal incoming. Watch your WhatsApp.</p>
              </div>
            ) : (
              <form onSubmit={(e) => handleSubmit(e, 'Private Inquiry')}>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px', lineHeight: '1.4' }}>
                  The more detail you give us, the better the proposal we send back. Usually in your WhatsApp within 4 hours.
                </p>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Name</label>
                  <input required type="text" name="name" className={styles.formInput} value={formData.name} onChange={handleInputChange} placeholder="Your full name" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>WhatsApp Number</label>
                  <input required type="tel" name="whatsapp" className={styles.formInput} value={formData.whatsapp} onChange={handleInputChange} placeholder="+1234567890" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Date</label>
                  <input required type="date" name="date" className={styles.formInput} value={formData.date} onChange={handleInputChange} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Group Size</label>
                  <input required type="number" name="groupSize" className={styles.formInput} value={formData.groupSize} onChange={handleInputChange} placeholder="E.g., 5" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Occasion</label>
                  <input required type="text" name="occasion" className={styles.formInput} value={formData.occasion} onChange={handleInputChange} placeholder="Birthday, Bachelor party, etc." />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Preferred Vibe</label>
                  <select required name="preferredVibe" className={styles.formSelect} value={formData.preferredVibe} onChange={handleInputChange}>
                    <option value="">Select vibe</option>
                    <option value="High-Energy VIP">High-Energy VIP Clubbing</option>
                    <option value="Intimate Lounge">Intimate Premium Lounge</option>
                    <option value="Exclusive Yacht/Villa">Exclusive Yacht or Villa</option>
                    <option value="Other">Other / Let you suggest</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Estimated Budget</label>
                  <input required type="text" name="budgetRange" className={styles.formInput} value={formData.budgetRange} onChange={handleInputChange} placeholder="E.g., 100k THB" />
                </div>
                
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : '✦ Send Inquiry — Custom Proposal Coming'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
