 import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servicesService, galleriesService, testimonialsService } from '../services/api';
import { useAuthStore } from '../store';

const STATIC_SERVICES = [
  {
    id: 1,
    name: 'Wedding Photography',
    description: 'Timeless wedding memories captured with elegance and emotion.',
    price: 'RWF 2,000,000',
    icon: '💍',
    slug: 'wedding-photography',
  },
  {
    id: 2,
    name: 'Pregnancy Photoshoots',
    description: 'Celebrate the beauty of motherhood with artistic maternity portraits.',
    price: 'RWF 1,000,000',
    icon: '🤰',
    slug: 'pregnancy-photoshoots',
  },
  {
    id: 3,
    name: 'Family Portraits',
    description: 'Cherish your family bonds through professional, heartfelt photography.',
    price: 'RWF 1,500,000',
    icon: '👨‍👩‍👧‍👦',
    slug: 'family-portraits',
  },
  {
    id: 4,
    name: 'Graduation Shoots',
    description: 'Mark your academic milestone with stunning graduation portraits.',
    price: 'RWF 1,000,000',
    icon: '🎓',
    slug: 'graduation-shoots',
  },
  {
    id: 5,
    name: 'Studio Sessions',
    description: 'Professional studio shoots with premium lighting and backdrops.',
    price: 'RWF 1,000,000',
    icon: '📸',
    slug: 'studio-sessions',
  },
  {
    id: 6,
    name: 'Outdoor Sessions',
    description: "Stunning natural light photography across Kigali's scenic landscapes.",
    price: 'RWF 1,000,000',
    icon: '🌿',
    slug: 'outdoor-sessions',
  },
];

const STATIC_PORTFOLIO = [
  {
    id: 1,
    title: 'Elegant Wedding Ceremony',
    image: '/assets/wedding.jpg.jpeg',
    category: 'Wedding',
  },
  {
    id: 2,
    title: 'Maternity Glow',
    image: '/assets/pregnancy.jpg.jpeg',
    category: 'Maternity',
  },
  {
    id: 3,
    title: 'Family Bonds',
    image: '/assets/family.jpg.jpeg',
    category: 'Family',
  },
  {
    id: 4,
    title: 'Graduation Triumph',
    image: '/assets/graduation.jpg.jpeg',
    category: 'Graduation',
  },
  {
    id: 5,
    title: 'Studio Elegance',
    image: '/assets/studio.jpg.jpeg',
    category: 'Studio',
  },
  {
    id: 6,
    title: 'Kigali Outdoors',
    image: '/assets/outdoor.jpg.jpeg',
    category: 'Outdoor',
  },
];

const STATIC_TESTIMONIALS = [
  {
    id: 1,
    name: 'Amina Uwase',
    role: 'Bride',
    quote:
      'Mophix Studio captured our wedding day beyond our wildest dreams. Every emotion, every detail — perfectly preserved forever. We are forever grateful!',
    avatar: 'AU',
    rating: 5,
  },
  {
    id: 2,
    name: 'Jean-Pierre Habimana',
    role: 'Graduate',
    quote:
      'My graduation photos came out absolutely stunning. The team made me feel so comfortable and the results were jaw-dropping. Highly recommended!',
    avatar: 'JH',
    rating: 5,
  },
  {
    id: 3,
    name: 'Claudine Mukamana',
    role: 'Mother',
    quote:
      'The maternity shoot was a magical experience. The photographer was professional, creative, and so kind. Our photos are treasured memories we will keep forever.',
    avatar: 'CM',
    rating: 5,
  },
];

const STATS = [
  { label: 'Sessions', value: '500+' },
  { label: 'Client Satisfaction', value: '100%' },
  { label: 'Years Experience', value: '7+' },
  { label: 'Location', value: 'Kigali, Rwanda' },
];

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();
  const [services, setServices] = useState(STATIC_SERVICES);
  const [portfolio, setPortfolio] = useState(STATIC_PORTFOLIO);
  const [testimonials, setTestimonials] = useState(STATIC_TESTIMONIALS);
  const [heroVisible, setHeroVisible] = useState(false);

  // Ronard media (images/videos) grouped by category.
  // Style/classes remain unchanged; only the grid content changes.
  const mediaByCategory = {
    // Use ONLY assets from frontend/src/images (no “camera”/placeholder media).
    Wedding: [
      { id: 'w1', title: 'Wedding', category: 'Wedding', src: '/assets/wedding.jpg.jpeg' },
      { id: 'w2', title: 'Wedding', category: 'Wedding', src: '/assets/wedding.jpg.jpeg' },
    ],
    Portrait: [
      { id: 'po1', title: 'Portrait', category: 'Portrait', src: '/assets/studio.jpg.jpeg' },
    ],
    Maternity: [
      { id: 'p1', title: 'Maternity', category: 'Maternity', src: '/assets/pregnancy.jpg.jpeg' },
    ],
    Family: [
      { id: 'f1', title: 'Family', category: 'Family', src: '/assets/family.jpg.jpeg' },
    ],
    Graduation: [
      { id: 'g1', title: 'Graduation', category: 'Graduation', src: '/assets/graduation.jpg.jpeg' },
      { id: 'g2', title: 'Graduation', category: 'Graduation', src: '/assets/graduation.jpg.jpeg' },
    ],
    Studio: [
      { id: 's1', title: 'Studio', category: 'Studio', src: '/assets/studio.jpg.jpeg' },
    ],
    Outdoor: [
      { id: 'o1', title: 'Outdoor', category: 'Outdoor', src: '/assets/outdoor.jpg.jpeg' },
    ],
  };


  const categorizedPortfolio = Object.entries(mediaByCategory).flatMap(([category, list]) =>
    list.map((m, idx) => ({
      id: `${category}-${m.id || idx}`,
      title: m.title,
      category,
      image: m.src,
    }))
  );

  // Helper to determine image source (Static vs API)
  const getImgSrc = (src) => {
    if (!src) return 'https://via.placeholder.com/800x600?text=No+Image';
    if (src.startsWith('http') || src.startsWith('/assets')) return src;
    return `http://localhost:5000/${src}`; // Replace with your actual backend URL
  };

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const svcData = await servicesService.getAll();
        if (svcData && svcData.length > 0) setServices(svcData.slice(0, 6));
      } catch {
        // fallback to static data
      }

      try {
        const galData = await galleriesService.getAll();
        if (galData && galData.length > 0) setPortfolio(galData.slice(0, 6));
      } catch {
        // fallback to static data
      }

      try {
        const testData = await testimonialsService.getAll();
        if (testData && testData.length > 0) setTestimonials(testData.slice(0, 3));
      } catch {
        // fallback to static data
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen font-inter">
      <style>
        {`
          @keyframes infinityScroll {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .animate-infinity-scroll {
            animation: infinityScroll 60s linear infinite;
          }
        `}
      </style>
      {/* ── HERO SECTION ────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Infinity Image Slider Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="flex w-[200%] h-full animate-infinity-scroll">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex w-1/2 h-full gap-4">
                {[
                  '/assets/wedding.jpg.jpeg',
                  '/assets/outdoor.jpg.jpeg',
                  '/assets/pregnancy.jpg.jpeg',
                  '/assets/family.jpg.jpeg',
                  '/assets/graduation.jpg.jpeg',
                  '/assets/studio.jpg.jpeg',
                  '/assets/wedding.jpg.jpeg',
                  '/assets/outdoor.jpg.jpeg'
                ].map((src, index) => (
                  <div key={index} className="w-[450px] flex-shrink-0 h-full border-r border-black/20">
                    {src.endsWith('.mp4') ? (
                      <video
                        src={src}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover brightness-[0.65]"
                      />
                    ) : (
                      <img
                        src={src}
                        alt="Gallery Background"
                        className="w-full h-full object-cover brightness-[0.85]"
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Dark Overlays for Professional Contrast and Focus */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        {/* Hero content */}
        <div
          className={`relative z-10 text-center px-6 max-w-5xl mx-auto transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-5 py-2 mb-8">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            <span className="text-orange-400 text-sm font-medium tracking-widest uppercase">
              Kigali&apos;s Premier Photography Studio
            </span>
          </div>

          <h1
            className="font-playfair text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Capture{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
                Moments
              </span>
            </span>
            <br />
            That Last a{' '}
            <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
              Lifetime
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Professional photography services tailored to preserve your most precious memories.
            Award-winning photographers serving Kigali and all of Rwanda.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to={isAuthenticated ? (user?.role === 'admin' ? '/admin/dashboard' : '/services') : '/register'}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold px-8 py-4 rounded-full text-lg overflow-hidden shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105"
            >
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {isAuthenticated ? 'Start Booking' : 'Book a Session'}
            </Link>
            <Link
              to="/portfolio"
              className="group inline-flex items-center gap-3 border-2 border-orange-500/50 text-orange-400 font-semibold px-8 py-4 rounded-full text-lg hover:bg-orange-500/10 hover:border-orange-400 transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              View Portfolio
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="animate-bounce flex flex-col items-center gap-1">
            <span className="text-gray-600 text-xs tracking-widest uppercase">Scroll</span>
            <svg className="w-5 h-5 text-orange-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/5 bg-black/40 backdrop-blur-md">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center py-5 px-4 border-r border-white/5 last:border-r-0"
              >
                <span
                  className="text-2xl md:text-3xl font-bold text-orange-400"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {stat.value}
                </span>
                <span className="text-gray-500 text-xs tracking-wider uppercase mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES PREVIEW ────────────────────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-orange-500 text-sm font-semibold tracking-[0.3em] uppercase">What We Offer</span>
          <h2
            className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Our Services
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            From intimate studio sessions to grand wedding ceremonies, we cover every milestone with artistry.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="group relative bg-white/3 border border-white/8 rounded-2xl p-7 hover:border-orange-500/40 hover:bg-orange-500/5 transition-all duration-500 overflow-hidden"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

              <div className="relative z-10">
                <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:bg-orange-500/20 transition-colors duration-300">
                  {service.icon}
                </div>
                <h3
                  className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors duration-300"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {service.name}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-orange-400 font-semibold text-sm">
                    From {service.price || `RWF ${service.starting_price?.toLocaleString()}`}
                  </span>
                  <Link
                    to={isAuthenticated ? `/book/${service.service_id || service.id}` : `/services/${service.slug || service.id}`}
                    className="text-sm text-gray-500 hover:text-orange-400 transition-colors duration-200 flex items-center gap-1"
                  >
                    {isAuthenticated ? 'Book Now' : 'Learn More'}
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 border border-orange-500/40 text-orange-400 px-8 py-3 rounded-full hover:bg-orange-500/10 transition-all duration-300 font-medium"
          >
            View All Services
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── PORTFOLIO PREVIEW ───────────────────────────────── */}
      <section className="py-24 px-6 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-orange-500 text-sm font-semibold tracking-[0.3em] uppercase">Our Work</span>
            <h2
              className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Featured Portfolio
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              A glimpse into the stories we&apos;ve had the privilege of telling through our lens.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolio.slice(0, 8).map((item, index) => (

              <div
                key={item.id}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer ${
                  index === 0 ? 'sm:row-span-2' : ''
                }`}
                style={{ aspectRatio: index === 0 ? 'auto' : '4/3', minHeight: index === 0 ? '400px' : '250px' }}
              >
                <img
                  src={getImgSrc(item.image || item.image_url)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase mb-1">
                    {item.category}
                  </span>
                  <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {item.title}
                  </h3>
                </div>
                {/* Corner accent */}
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-orange-400/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-3 rounded-full hover:bg-orange-500/10 hover:border-orange-500/40 hover:text-orange-400 transition-all duration-300 font-medium"
            >
              View Full Portfolio
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-orange-500 text-sm font-semibold tracking-[0.3em] uppercase">Client Stories</span>
            <h2
              className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              What Our Clients Say
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Real words from real clients — families, couples, and graduates across Rwanda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="group relative bg-white/3 border border-white/8 rounded-2xl p-8 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all duration-500"
              >
                {/* Quote icon */}
                <div className="text-orange-500/20 text-7xl font-serif leading-none absolute top-4 right-6 select-none">
                  &ldquo;
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-300 leading-relaxed mb-8 relative z-10 italic">
                  &ldquo;{t.quote || t.message}&rdquo;
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-black font-bold text-sm">
                    {t.avatar || (t.name ? t.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'CL')}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{t.name || t.client_name}</p>
                    <p className="text-orange-400 text-sm">{t.role || t.service_type || 'Client'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ─────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500" />
            <div className="absolute inset-0 bg-[#0a0a0a]/20" />
            {/* Pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '30px 30px',
              }}
            />
            {/* Glow blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl" />

            <div className="relative z-10 text-center py-20 px-8">
              <h2
                className="text-4xl md:text-6xl font-bold text-white mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Ready to Book Your Session?
              </h2>
              <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto">
                Join 500+ happy clients across Kigali. Let&apos;s create something beautiful together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to={isAuthenticated ? '/services' : '/register'}
                  className="inline-flex items-center gap-2 bg-black text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-900 transition-all duration-300 hover:scale-105 shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {isAuthenticated ? 'Explore Studio' : 'Book a Session Now'}
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur border border-white/30 text-white font-semibold px-8 py-4 rounded-full text-lg hover:bg-white/30 transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
