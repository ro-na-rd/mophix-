import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servicesService } from '../services/api';
import { useAuthStore } from '../store';

const STATIC_SERVICES = [
  {
    id: 1,
    slug: 'wedding-photography',
    name: 'Wedding Photography',
    icon: '💍',
    description:
      'Your wedding day is a once-in-a-lifetime moment that deserves to be captured in every exquisite detail. Our wedding photographers blend editorial artistry with documentary storytelling to deliver timeless images you will treasure forever.',
    starting_price: 2000000,
    duration: 'Full Day (8–10 hrs)',

    highlight: 'Most Popular',
    features: ['Engagement pre-shoot', 'Two photographers', 'Same-day highlight preview', '400+ edited images'],
  },
  {
    id: 2,
    slug: 'pregnancy-photoshoots',
    name: 'Pregnancy Photoshoots',
    icon: '🤰',
    description:
      'Celebrate the miracle of new life with a luxurious maternity session. We create soft, artistic portraits that beautifully capture the glow of motherhood, creating a timeless visual story of this precious chapter.',
    starting_price: 'RWF 1,000,000',
    duration: '2–3 Hours',
    highlight: null,
    features: ['Indoor & outdoor options', 'Professional styling advice', 'Partner & family included', '80+ edited images'],
  },
  {
    id: 3,
    slug: 'family-portraits',
    name: 'Family Portraits',
    icon: '👨‍👩‍👧‍👦',
    description:
      'Freeze this moment in time with stunning family portraits that capture your unique bond. From playful candids to elegant formal shots, we create images that tell your family story authentically.',
    starting_price: 'RWF 1,500,000',
    duration: '1.5–2 Hours',
    highlight: null,
    features: ['All family sizes welcome', 'Multiple outfit changes', 'Studio or outdoor', '60+ edited images'],
  },
  {
    id: 4,
    slug: 'graduation-shoots',
    name: 'Graduation Shoots',
    icon: '🎓',
    description:
      'Your academic achievement deserves to be immortalised. Our graduation photography sessions create powerful, celebratory portraits that you will be proud to share for years to come.',
    starting_price: 'RWF 1,000,000',
    duration: '1–2 Hours',
    highlight: null,
    features: ['Multiple locations', 'Academic regalia shots', 'Casual & formal styles', '50+ edited images'],
  },
  {
    id: 5,
    slug: 'studio-sessions',
    name: 'Studio Sessions',
    icon: '📸',
    description:
      'Our professional studio is equipped with premium lighting rigs, a variety of backdrops, and all the tools needed for flawless professional portraits, headshots, and creative concept shoots.',
    starting_price: 'RWF 1,000,000',
    duration: '1–1.5 Hours',
    highlight: 'Best Value',
    features: ['Professional lighting setup', 'Multiple backdrops', 'Hair & makeup guidance', '40+ edited images'],
  },
  {
    id: 6,
    slug: 'outdoor-sessions',
    name: 'Outdoor Sessions',
    icon: '🌿',
    description:
      "Kigali's breathtaking hills, gardens, and urban landscapes make the perfect backdrop for natural, vibrant photography. We scout the best locations to match your vision perfectly.",
    starting_price: 'RWF 1,000,000',
    duration: '1.5–2 Hours',
    highlight: null,
    features: ["Premium Kigali locations", 'Golden hour scheduling', 'Natural light mastery', '60+ edited images'],
  },
  {
    id: 7,
    slug: 'event-coverage',
    name: 'Event Coverage',
    icon: '🎉',
    description:
      'Corporate events, birthday celebrations, product launches, and cultural ceremonies — we provide comprehensive event photography that captures every important moment from start to finish.',
    starting_price: 'RWF 2,000,000',
    duration: 'Custom (4–12 hrs)',
    highlight: null,
    features: ['Dedicated event team', 'Quick 48-hr turnaround', 'Print-ready resolution', '300+ edited images'],
  },
];

const WHY_CHOOSE_US = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Professional Equipment',
    description: 'We shoot exclusively with Sony & Canon full-frame mirrorless systems, premium lenses, and broadcast-quality studio lighting for unmatched image quality.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Expert Photographers',
    description: 'Our team of 7+ seasoned photographers brings over 7 years of combined experience, with expertise in diverse styles from photojournalism to fine art portraiture.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Quick Delivery',
    description: 'We understand your excitement. Receive a selection of preview images within 24 hours, and your fully edited gallery delivered within 7–14 days of your session.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: 'Satisfaction Guaranteed',
    description: "Your happiness is our success. We offer a 100% satisfaction guarantee — if you're not delighted with the results, we'll reshoot at no additional cost.",
  },
];

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Book a Session',
    description: 'Choose your desired service, pick a date, and submit your booking request through our easy online form. We respond within 2 hours.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Consultation',
    description: 'We meet (virtually or in-person) to understand your vision, style preferences, and plan every detail of your session for a personalised experience.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'The Shoot',
    description: "On the day, relax and be yourself while our expert photographers work their magic. We direct, guide, and create a comfortable environment for natural results.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Image Delivery',
    description: 'Receive your beautifully edited images via a private online gallery. Download in full resolution, share with loved ones, and order prints directly.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
];

export default function Services() {
  const { isAuthenticated } = useAuthStore();
  const [services, setServices] = useState(STATIC_SERVICES);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Portraits', 'Events', 'Studio'];

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const data = await servicesService.getAll();
        if (data && data.length > 0) setServices(data);
      } catch {
        // fallback to static data
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen">
      {/* ── PAGE HEADER ─────────────────────────────────────── */}
      <section className="relative py-28 px-6 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-500 opacity-8 rounded-full blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(251,146,60,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(251,146,60,0.4) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 rounded-full px-5 py-2 mb-6">
            <span className="text-orange-400 text-sm font-medium tracking-widest uppercase">What We Offer</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Services
            </span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
            Everything from intimate weddings to dynamic studio sessions — crafted with passion,
            delivered with excellence.
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-orange-500/50" />
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-orange-500/50" />
          </div>
        </div>
      </section>
      {/* ── SERVICES GRID ───────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="bg-white/3 border border-white/5 rounded-2xl p-7 animate-pulse">
                  <div className="w-14 h-14 bg-white/5 rounded-xl mb-5" />
                  <div className="h-5 bg-white/5 rounded mb-3 w-3/4" />
                  <div className="h-3 bg-white/5 rounded mb-2" />
                  <div className="h-3 bg-white/5 rounded mb-2 w-5/6" />
                  <div className="h-3 bg-white/5 rounded w-4/6" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className={`group relative bg-white/3 border rounded-2xl p-7 hover:border-orange-500/40 transition-all duration-500 overflow-hidden flex flex-col ${
                    service.highlight
                      ? 'border-orange-500/40 bg-orange-500/5'
                      : 'border-white/8 hover:bg-orange-500/5'
                  } ${index === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                >
                  {/* Highlight badge */}
                  {service.highlight && (
                    <div className="absolute top-5 right-5 bg-gradient-to-r from-orange-500 to-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                      {service.highlight}
                    </div>
                  )}

                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Icon */}
                  <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-orange-500/20 group-hover:scale-110 transition-all duration-300">
                    {service.icon}
                  </div>

                  {/* Name */}
                  <h3
                    className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors duration-300"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {service.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed mb-5 flex-1">{service.description}</p>

                  {/* Features */}
                  {service.features && (
                    <ul className="space-y-2 mb-6">
                      {service.features.map((f, fi) => (
                        <li key={fi} className="flex items-center gap-2 text-sm text-gray-400">
                          <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Price & Duration */}
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/8">
                    <div>
                      <p className="text-gray-600 text-xs uppercase tracking-wider mb-1">Starting from</p>
                      <p className="text-orange-400 font-bold text-lg">
                        RWF {(service.starting_price || service.price || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600 text-xs uppercase tracking-wider mb-1">Duration</p>
                      <p className="text-gray-300 text-sm font-medium">{service.duration}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <Link
                      to={isAuthenticated ? `/book/${service.service_id || service.id}` : '/register'}
                      className="flex-1 text-center bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/25 hover:scale-105 transition-all duration-300 text-sm"
                    >
                      {isAuthenticated ? 'Reserve Session' : 'Book Now'}
                    </Link>
                    <Link
                      to={`/services/${service.slug || service.id}`}
                      className="flex-1 text-center border border-white/10 text-gray-300 py-3 rounded-xl hover:border-orange-500/40 hover:text-orange-400 transition-all duration-300 text-sm font-medium"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY CHOOSE US ───────────────────────────────────── */}
      <section className="py-24 px-6 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-orange-500 text-sm font-semibold tracking-[0.3em] uppercase">Our Promise</span>
            <h2
              className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Why Choose Mophix Studio?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We don&apos;t just take photos — we craft visual experiences that endure. Here&apos;s what sets us apart.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE_US.map((item, i) => (
              <div
                key={i}
                className="group bg-white/3 border border-white/8 rounded-2xl p-8 hover:border-orange-500/40 hover:bg-orange-500/5 transition-all duration-500 text-center"
              >
                <div className="w-16 h-16 mx-auto bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center text-orange-400 mb-6 group-hover:bg-orange-500/20 group-hover:scale-110 transition-all duration-300">
                  {item.icon}
                </div>
                <h3
                  className="text-lg font-bold text-white mb-3 group-hover:text-orange-400 transition-colors duration-300"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR PROCESS ─────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-orange-500 text-sm font-semibold tracking-[0.3em] uppercase">Simple & Seamless</span>
            <h2
              className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              How It Works
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              We&apos;ve designed a smooth, stress-free experience from first contact to final delivery.
            </p>
          </div>

          <div className="relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-px">
              <div className="h-full bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {PROCESS_STEPS.map((step, i) => (
                <div key={i} className="group flex flex-col items-center text-center">
                  {/* Step number + icon */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30 rounded-2xl flex items-center justify-center text-orange-400 group-hover:border-orange-500/60 group-hover:bg-orange-500/20 transition-all duration-500 group-hover:scale-110">
                      {step.icon}
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-black text-xs font-black">
                      {step.step}
                    </div>
                  </div>

                  <h3
                    className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors duration-300"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ──────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500" />
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '25px 25px',
              }}
            />
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl" />

            <div className="relative z-10 text-center py-16 px-8">
              <h2
                className="text-3xl md:text-5xl font-bold text-white mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Ready to Create Magic?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Book your session today and let Mophix Studio transform your most cherished moments into art.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to={isAuthenticated ? '/services' : '/register'}
                  className="inline-flex items-center gap-2 bg-black text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-900 transition-all duration-300 hover:scale-105 shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {isAuthenticated ? 'Go to Services' : 'Book a Session'}
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-full text-lg hover:bg-white/30 transition-all duration-300 hover:scale-105"
                >
                  Talk to Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
