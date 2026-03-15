
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Calendar as CalendarIcon, CreditCard, Trash2, CheckCircle, 
  BarChart3, Settings, LogOut, Search, Filter, RefreshCw, ChevronLeft, ChevronRight, List,
  DollarSign
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Booking, Room } from '../types';
import { bookingService, roomService } from '../src/services';

const AdminDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'analytics' | 'rooms'>('bookings');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    conversionRate: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingsResponse, roomsResponse, analyticsResponse] = await Promise.all([
        bookingService.getAllBookings(),
        roomService.getAllRooms(),
        bookingService.getAnalytics()
      ]);

      setBookings(bookingsResponse.data.bookings);
      setRooms(roomsResponse.data.rooms);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this booking permanently?')) {
      try {
        await bookingService.deleteBooking(id);
        setBookings(bookings.filter(b => b.bookingId !== id));
      } catch (error) {
        console.error('Failed to delete booking:', error);
        alert('Failed to delete booking. Please try again.');
      }
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await bookingService.updateBooking(id, { status: 'confirmed' });
      setBookings(bookings.map(b => 
        b.bookingId === id ? { ...b, status: 'confirmed' } : b
      ));
    } catch (error) {
      console.error('Failed to confirm booking:', error);
      alert('Failed to confirm booking. Please try again.');
    }
  };

  const filteredBookings = useMemo(() => {
    let result = bookings;
    if (searchTerm) {
      result = result.filter(b => 
        b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.phone.includes(searchTerm)
      );
    }
    if (selectedDate && viewMode === 'calendar') {
      result = result.filter(b => b.date === selectedDate);
    }
    return result;
  }, [bookings, searchTerm, selectedDate, viewMode]);

  // Calendar Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const offset = firstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayBookings = bookings.filter(b => b.date === dateStr);
      days.push({ day: i, date: dateStr, bookings: dayBookings });
    }
    return days;
  }, [currentMonth, bookings]);

  const changeMonth = (dir: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + dir, 1));
  };

  // Analytics Data
  const statsData = useMemo(() => {
    const roomStats = rooms.map(room => ({
      name: room.name.split(' ')[1] || room.name, // Get second word or full name
      value: bookings.filter(b => b.roomId === room.roomId).length
    }));
    return roomStats;
  }, [bookings, rooms]);

  const totalRevenue = analytics.totalRevenue;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div>
            <h1 className="font-royal text-4xl font-black gold-gradient mb-2 uppercase tracking-widest">ROYAL CONSOLE</h1>
            <p className="text-gray-400 font-light tracking-wide italic">Managing the legacy of Sai Lakshya Talkies.</p>
          </div>
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 backdrop-blur-md">
            {[
              { id: 'bookings', label: 'Bookings', icon: CalendarIcon },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'rooms', label: 'Rooms', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-royal text-sm transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#d4af37] text-black font-bold royal-shadow' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="glass-card p-6 rounded-2xl border-l-4 border-[#d4af37]">
            <div className="flex justify-between items-center mb-4">
              <Users className="text-[#d4af37]" />
              <span className="text-[10px] uppercase text-gray-500 tracking-widest">Total Bookings</span>
            </div>
            <div className="text-3xl font-royal font-black text-white">{analytics.totalBookings}</div>
          </div>
          <div className="glass-card p-6 rounded-2xl border-l-4 border-green-500">
            <div className="flex justify-between items-center mb-4">
              <CreditCard className="text-green-500" />
              <span className="text-[10px] uppercase text-gray-500 tracking-widest">Collected Revenue</span>
            </div>
            <div className="text-3xl font-royal font-black text-white">₹{analytics.totalRevenue.toLocaleString()}</div>
          </div>
          <div className="glass-card p-6 rounded-2xl border-l-4 border-blue-500">
            <div className="flex justify-between items-center mb-4">
              <CheckCircle className="text-blue-500" />
              <span className="text-[10px] uppercase text-gray-500 tracking-widest">Confirmed</span>
            </div>
            <div className="text-3xl font-royal font-black text-white">{analytics.confirmedBookings}</div>
          </div>
          <div className="glass-card p-6 rounded-2xl border-l-4 border-purple-500">
             <div className="flex justify-between items-center mb-4">
              <RefreshCw className="text-purple-500" />
              <span className="text-[10px] uppercase text-gray-500 tracking-widest">Conversion Rate</span>
            </div>
            <div className="text-3xl font-royal font-black text-white">{analytics.conversionRate}%</div>
          </div>
        </div>

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/10">
              <div className="flex gap-2">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-royal transition-all ${viewMode === 'list' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                  <List size={18} />
                  LIST VIEW
                </button>
                <button 
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-royal transition-all ${viewMode === 'calendar' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                  <CalendarIcon size={18} />
                  CALENDAR VIEW
                </button>
              </div>
              
              <div className="relative w-64 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Quick Search..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg outline-none focus:border-[#d4af37] text-sm"
                />
              </div>
            </div>

            {viewMode === 'calendar' && (
              <div className="glass-card p-8 rounded-2xl border border-[#d4af37]/20">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-royal text-2xl font-black gold-gradient uppercase">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex gap-3">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft /></button>
                    <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-1 border border-[#d4af37]/40 rounded-full text-xs font-royal hover:bg-[#d4af37]/10">Today</button>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight /></button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-px bg-[#d4af37]/10 rounded-xl overflow-hidden border border-[#d4af37]/20">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="bg-black/60 p-4 text-center font-royal text-xs text-gray-500 uppercase tracking-widest">{d}</div>
                  ))}
                  {calendarDays.map((dayObj, i) => (
                    <div 
                      key={i} 
                      onClick={() => dayObj && setSelectedDate(dayObj.date)}
                      className={`min-h-[100px] p-2 bg-black/40 transition-all ${dayObj ? 'cursor-pointer hover:bg-[#d4af37]/5' : ''} ${selectedDate === dayObj?.date ? 'ring-2 ring-inset ring-[#d4af37]' : ''}`}
                    >
                      {dayObj && (
                        <>
                          <div className="flex justify-between items-start">
                            <span className={`text-sm ${dayObj.bookings.length > 0 ? 'text-[#d4af37] font-bold' : 'text-gray-500'}`}>{dayObj.day}</span>
                            {dayObj.bookings.length > 0 && (
                              <div className="w-2 h-2 rounded-full bg-[#d4af37] shadow-[0_0_10px_#d4af37]" />
                            )}
                          </div>
                          <div className="mt-2 space-y-1">
                            {dayObj.bookings.slice(0, 2).map((b, idx) => (
                              <div key={idx} className="text-[10px] bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] px-1 py-0.5 rounded truncate">
                                {b.customerName.split(' ')[0]} - {b.timeSlot.split(' ')[0]}
                              </div>
                            ))}
                            {dayObj.bookings.length > 2 && (
                              <div className="text-[8px] text-gray-500 text-center font-bold">+{dayObj.bookings.length - 2} MORE</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                
                {selectedDate && (
                  <div className="mt-6 flex items-center gap-4 text-sm animate-fade-in-down">
                    <span className="text-gray-400">Showing Bookings for:</span>
                    <span className="font-royal font-bold text-[#d4af37]">{new Date(selectedDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                    <button onClick={() => setSelectedDate(null)} className="text-xs text-red-400 hover:underline">Clear Filter</button>
                  </div>
                )}
              </div>
            )}

            <div className="glass-card rounded-2xl overflow-hidden border-[#d4af37]/20 border">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-black/60 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 font-royal text-xs tracking-widest text-[#d4af37] uppercase">ID</th>
                      <th className="px-6 py-4 font-royal text-xs tracking-widest text-[#d4af37] uppercase">Customer</th>
                      <th className="px-6 py-4 font-royal text-xs tracking-widest text-[#d4af37] uppercase">Room / Date</th>
                      <th className="px-6 py-4 font-royal text-xs tracking-widest text-[#d4af37] uppercase">Method</th>
                      <th className="px-6 py-4 font-royal text-xs tracking-widest text-[#d4af37] uppercase">Payment</th>
                      <th className="px-6 py-4 font-royal text-xs tracking-widest text-[#d4af37] uppercase">Status</th>
                      <th className="px-6 py-4 font-royal text-xs tracking-widest text-[#d4af37] uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-light">No bookings found {selectedDate ? 'for this date' : 'in the archives'}.</td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4">
                            <span className="text-xs font-mono text-gray-500">{b.bookingId}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold">{b.customerName}</div>
                            <div className="text-xs text-gray-500 font-light">{b.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">{rooms.find(r => r.roomId === b.roomId)?.name}</div>
                            <div className="text-xs text-[#d4af37]">{b.date} • {b.timeSlot}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                              b.paymentMethod === 'manual' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {b.paymentMethod || 'online'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold">₹{b.amountPaid?.toLocaleString() || b.totalPrice.toLocaleString()} Paid</span>
                              <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                                {b.paymentOption === 'full' ? 'Full Payment' : `Advance (Total: ₹${b.totalPrice.toLocaleString()})`}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-tighter uppercase ${
                              b.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {b.status !== 'confirmed' && (
                                <button 
                                  onClick={() => handleConfirm(b.bookingId)}
                                  title="Confirm Booking"
                                  className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all"
                                >
                                  <CheckCircle size={18} />
                                </button>
                              )}
                              <button 
                                onClick={() => handleDelete(b.bookingId)}
                                title="Delete Booking"
                                className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="glass-card p-8 rounded-2xl border border-[#d4af37]/20">
                <h3 className="font-royal text-xl font-bold mb-8 gold-gradient uppercase tracking-widest">ROOM POPULARITY</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a0000', border: '1px solid #d4af37', borderRadius: '8px' }}
                        itemStyle={{ color: '#d4af37' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {statsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#bf953f', '#fcf6ba', '#b38728', '#aa771c'][index % 4]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-8 rounded-2xl border border-[#d4af37]/20 flex flex-col justify-center text-center">
                <div className="w-24 h-24 bg-[#d4af37]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="text-[#d4af37]" size={40} />
                </div>
                <h3 className="font-royal text-2xl font-bold mb-4 uppercase tracking-widest">INSIGHTS ENGINE</h3>
                <p className="text-gray-400 font-light mb-8 max-w-sm mx-auto leading-relaxed">
                  Deep intelligence is identifying your growth patterns. Revenue has increased by 12% since implementing the 50% advance option.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                    <span className="block text-gray-500 text-[10px] uppercase mb-1 tracking-widest">Peak Slot</span>
                    <span className="block font-royal font-bold text-[#d4af37]">05:00 - 08:00 PM</span>
                  </div>
                  <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                    <span className="block text-gray-500 text-[10px] uppercase mb-1 tracking-widest">Top Add-on</span>
                    <span className="block font-royal font-bold text-[#d4af37]">Fog Effect</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {rooms.map(room => (
                <div key={room.roomId} className="glass-card rounded-2xl overflow-hidden group">
                  <div className="h-40 relative">
                     <img src={room.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                     <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-all"></div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-royal font-bold mb-4 uppercase tracking-widest">{room.name}</h4>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 uppercase tracking-widest">Base Price</span>
                        <span className="text-white font-bold">₹{room.price}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 uppercase tracking-widest">Max Cap</span>
                        <span className="text-white font-bold">{room.maxCapacity}</span>
                      </div>
                    </div>
                    <button className="w-full py-2 bg-white/5 hover:bg-[#d4af37] hover:text-black font-royal text-xs font-bold rounded transition-all uppercase tracking-widest">
                      EDIT CONFIG
                    </button>
                  </div>
                </div>
              ))}
              <div className="glass-card rounded-2xl border-dashed border-2 border-white/10 flex flex-col items-center justify-center p-8 text-gray-500 hover:border-[#d4af37] hover:text-[#d4af37] transition-all cursor-pointer">
                <RefreshCw className="mb-2" />
                <span className="font-royal text-sm font-bold uppercase tracking-widest">Add New Room</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
};

export default AdminDashboard;
