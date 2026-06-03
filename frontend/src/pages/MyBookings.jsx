import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsService } from '../services/api';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';
import ClientSidebar from '../components/ClientSidebar';
import { getBackendAssetUrl } from '../utils/apiUrl';

const STATUS_CONFIG = {
  pending: { label: 'Pending', cls: 'badge-pending', icon: '🕐' },
  confirmed: { label: 'Confirmed', cls: 'badge-confirmed', icon: '✅' },
  completed: { label: 'Completed', cls: 'badge-completed', icon: '🎉' },
  cancelled: { label: 'Cancelled', cls: 'badge-cancelled', icon: '❌' },
};

const PAYMENT_CONFIG = {
  unpaid: { label: 'Unpaid', cls: 'badge-cancelled' },
  partial: { label: 'Partial', cls: 'badge-pending' },
  paid: { label: 'Paid', cls: 'badge-completed' },
};

const MyBookings = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  // Helper to get the correct URL for the uploaded files
  const getFileUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('blob:') || url.startsWith('http')) {
      return url;
    }
    return getBackendAssetUrl(url);
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingsService.getAll();
      
      // Backend returns: { success: true, data: [...], pagination: {...} }
      const rows =
        Array.isArray(res) ? res :
        Array.isArray(res?.data) ? res.data :
        Array.isArray(res?.results) ? res.results :
        Array.isArray(res?.data?.results) ? res.data.results :
        [];

      setBookings(rows);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      toast.error('Failed to load bookings. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      fetchBookings();
    }
  }, [user?.user_id]);

  const filtered =
    activeFilter === 'all' ? bookings : bookings.filter((b) => b.status === activeFilter);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking request?')) return;
    try {
      await bookingsService.cancel(id);
      setBookings(prev => prev.map(b => (b.booking_id === id || b.id === id) ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled successfully');
    } catch (err) {
      toast.error(err?.message || 'Failed to cancel booking');
    }
  };

  const tabs = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] pt-20">
      <ClientSidebar />
      <main className="ml-64 flex-1 py-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <p className="section-tag">My Account</p>
              <h1 className="section-title mb-0">My Bookings</h1>
              <p className="text-gray-400 mt-1">Track and manage your photography sessions</p>
            </div>
            <Link to="/services" className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Book New Session
            </Link>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Bookings', value: bookings.length, color: 'text-white' },
              {
                label: 'Pending',
                value: bookings.filter((b) => b.status === 'pending').length,
                color: 'text-yellow-400',
              },
              {
                label: 'Confirmed',
                value: bookings.filter((b) => b.status === 'confirmed').length,
                color: 'text-blue-400',
              },
              {
                label: 'Completed',
                value: bookings.filter((b) => b.status === 'completed').length,
                color: 'text-green-400',
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="card p-4 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-gray-500 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
                  activeFilter === tab
                    ? 'bg-orange-500 text-black'
                    : 'text-gray-400 hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                {tab === 'all' ? 'All Bookings' : tab}
                {tab !== 'all' && (
                  <span className="ml-1.5 text-xs opacity-70">({bookings.filter((b) => b.status === tab).length})</span>
                )}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <svg className="animate-spin w-10 h-10 text-orange-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-gray-400">Loading your bookings...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">No bookings yet</h3>
              <p className="text-gray-400 mb-6">
                {activeFilter === 'all'
                  ? "You haven't made any booking requests yet."
                  : `No ${activeFilter} bookings found.`}
              </p>
              <Link to="/services" className="btn-primary inline-flex">
                Explore Our Services
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((booking) => {
                const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                const payment = PAYMENT_CONFIG[booking.payment_status] || PAYMENT_CONFIG.unpaid;

                return (
                  <div
                    key={booking.booking_id || booking.id}
                    className="card p-6 cursor-pointer"
                    onClick={() => setSelected(booking)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-2xl flex-shrink-0">
                          {status.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 flex-wrap mb-1">
                            <h3 className="text-white font-semibold">{booking.Service?.name || 'Photography Session'}</h3>
                            <span className={`badge ${status.cls}`}>{status.label}</span>
                            <span className={`badge ${payment.cls}`}>{payment.label}</span>
                          </div>
                          <p className="text-gray-400 text-sm">
                            📅{' '}
                            {booking.event_date
                              ? new Date(booking.event_date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : 'Date TBD'}
                          </p>
                          <p className="text-gray-500 text-sm">📍 {booking.event_location || 'Location TBD'}</p>
                          
                          {/* Prominent Download/Pay Action for Client */}
                          {booking.status === 'completed' && booking.completed_file_url && (
                            <div className="mt-4 flex flex-wrap gap-3">
                              <a
                                href={getFileUrl(booking.completed_file_url)}
                                download
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black text-xs font-black rounded-xl hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/30 uppercase tracking-wider"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download Final Photos
                              </a>
                            </div>
                          )}

                          {/* Pay button for bookings when not paid */}
                          {booking.status !== 'cancelled' &&
                            (!booking.payment_status || booking.payment_status !== 'paid') && (
                              <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                    onClick={async (e) => {
                                    e.stopPropagation();
                                    const mobile_number = window.prompt('Enter your Mobile Number (MTN/Airtel):');
                                    if (!mobile_number) return;
                                    
                                    const pin = window.prompt('Enter your Secret PIN to authorize payment:');
                                    if (!pin) return;

                                    try {
                                      const res = await bookingsService.pay(booking.booking_id || booking.id, { mobile_number });
                                      setBookings(prev =>
                                        prev.map(b => (b.booking_id === (booking.booking_id || booking.id) || b.id === (booking.booking_id || booking.id))
                                          ? { ...b, payment_status: 'paid', ...res?.data }
                                          : b)
                                      );
                                      toast.success('Payment successful ✅');
                                    } catch (err) {
                                      toast.error(err?.message || 'Payment failed');
                                    }
                                  }}
                                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black text-xs font-black rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30 uppercase tracking-wider"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 1.343-3 3v5a1 1 0 001 1h4a1 1 0 001-1v-5c0-1.657-1.343-3-3-3z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 8V7a3 3 0 016 0v1" />
                                  </svg>
                                  Pay
                                </button>
                                <div className="flex items-center px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-gray-300">
                                  Amount:&nbsp;
                                  <span className="text-orange-400 font-bold">
                                    RWF {Number(booking.total_price || booking.Service?.price || 0).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            )}

                          
                          {/* Delivered Asset Preview for Client */}
                          {booking.status === 'completed' && booking.completed_file_url && /\.(jpg|jpeg|png|webp)$/i.test(booking.completed_file_url) && (
                            <div className="mt-3 w-40 h-24 rounded-lg overflow-hidden border border-white/10 shadow-inner">
                              <img src={getFileUrl(booking.completed_file_url)} alt="Delivered Preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-orange-400 font-bold text-lg">
                          RWF {Number(booking.total_price || booking.Service?.price || 0).toLocaleString()}
                        </p>
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancel(booking.booking_id || booking.id);
                            }}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            Cancel Request
                          </button>
                        )}
                      </div>
                    </div>

                    {booking.special_requests && (
                      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <p className="text-gray-500 text-sm">
                          <span className="text-gray-400 font-medium">Notes: </span>
                          {booking.special_requests}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Detail Modal */}
          {selected && (
            <div className="modal-overlay" onClick={() => setSelected(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Booking Details</h2>
                  <button
                    onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  {[
                    ['Service', selected.Service?.name || 'N/A'],
                    ['Status', selected.status],
                    ['Payment', selected.payment_status],
                    [
                      'Event Date',
                      selected.event_date ? new Date(selected.event_date).toDateString() : 'N/A',
                    ],
                    ['Location', selected.event_location || 'N/A'],
                    ['Participants', selected.number_of_participants],
                    ['Total Price', `RWF ${Number(selected.total_price || 0).toLocaleString()}`],
                    ...(selected.completed_file_url ? [['File Link', <a href={getFileUrl(selected.completed_file_url)} target="_blank" rel="noreferrer" className="text-orange-400 underline font-bold">Download Delivered Assets</a>]] : []),
                  ].map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-500">{key}</span>
                      <span className="text-gray-200 font-medium capitalize">{val}</span>
                    </div>
                  ))}

                  {selected.special_requests && (
                    <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      <p className="text-gray-500 mb-1">Special Requests</p>
                      <p className="text-gray-300">{selected.special_requests}</p>
                    </div>
                  )}

                  {selected.notes && (
                    <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      <p className="text-gray-500 mb-1">Admin Notes</p>
                      <p className="text-gray-300">{selected.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {selected.status !== 'cancelled' && selected.status !== 'completed' && (
                    <div className="pt-6 mt-4 border-t border-white/5">
                      <button
                        onClick={() => {
                          handleCancel(selected.booking_id || selected.id);
                          setSelected(null);
                        }}
                        className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all font-semibold text-sm"
                      >
                        Cancel Booking Request
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyBookings;
