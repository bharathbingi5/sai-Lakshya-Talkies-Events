import React, { useState, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle,
  CreditCard,
  Smartphone,
  ReceiptText,
  ArrowLeft,
  Download,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { ADDONS, TIME_SLOTS } from '../constants';
import { Room } from '../types';
import { useToast } from '../App';
import { bookingService, roomService } from '../src/services';

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const preSelectedRoomId = location.state?.roomId || '';

  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentOption, setPaymentOption] = useState<'full' | 'half'>('full');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'manual'>('online');
  const [bookingId, setBookingId] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const roomIdSetRef = useRef(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    roomId: preSelectedRoomId,
    date: '',
    timeSlot: TIME_SLOTS[0],
    adults: 1,
    children: 0,
    selectedAddons: [] as string[],
  });

  // Fetch rooms on component mount
  React.useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await roomService.getAllRooms();
        const roomsData = response.data.rooms;
        setRooms(roomsData);
        if (!formData.roomId && !roomIdSetRef.current && roomsData.length > 0) {
          setFormData(prev => ({ ...prev, roomId: roomsData[0].roomId }));
          roomIdSetRef.current = true;
        }
      } catch {
        showToast('Error', 'Failed to load rooms. Please refresh the page.', 'info');
      }
    };

    fetchRooms();
  }, []);

  const selectedRoom = useMemo(
    () => rooms.find(r => r.roomId === formData.roomId) || null,
    [formData.roomId, rooms]
  );

  const totalPrice = useMemo(() => {
    let price = selectedRoom.price;
    const totalMembers = formData.adults + formData.children;

    if (totalMembers > selectedRoom.basePackage) {
      const extraAdults = Math.max(0, formData.adults - selectedRoom.basePackage);
      const remainingSlots = Math.max(0, selectedRoom.basePackage - formData.adults);
      const extraChildren = Math.max(0, formData.children - remainingSlots);

      price += extraAdults * selectedRoom.extraAdultCharge;
      price += extraChildren * selectedRoom.extraChildCharge;
    }

    formData.selectedAddons.forEach(addonId => {
      const addon = ADDONS.find(a => a.id === addonId);
      if (addon) price += addon.price;
    });

    return price;
  }, [formData, selectedRoom]);

  const amountToPayNow = paymentOption === 'full' ? totalPrice : totalPrice * 0.5;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleAddon = (addonId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAddons: prev.selectedAddons.includes(addonId)
        ? prev.selectedAddons.filter(id => id !== addonId)
        : [...prev.selectedAddons, addonId],
    }));
  };

  const proceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const bookingData = {
        customerName: formData.name,
        phone: formData.phone,
        email: formData.email,
        roomId: formData.roomId,
        date: formData.date,
        timeSlot: formData.timeSlot,
        adults: formData.adults,
        children: formData.children,
        addons: formData.selectedAddons,
        totalPrice: totalPrice,
        paymentOption: paymentOption,
        paymentMethod: paymentMethod,
        amountPaid: amountToPayNow,
      };

      const response = await bookingService.createBooking(bookingData);
      setBookingId(response.data.booking.bookingId);

      setIsSubmitting(false);
      setStep('success');
      showToast('Success!', `Booking confirmed. Receipt sent to ${formData.email}`, 'success');
    } catch (error) {
      setIsSubmitting(false);
      const errorMessage =
        (error as any).response?.data?.message || 'Failed to create booking. Please try again.';
      showToast('Error', errorMessage, 'info');
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="glass-card p-8 md:p-12 rounded-3xl relative overflow-hidden royal-shadow animate-scale-up border-[#d4af37]/50">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#bf953f] to-[#aa771c]"></div>

            <div className="flex flex-col items-center mb-10 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="text-green-500" size={48} />
              </div>
              <h2 className="font-royal text-4xl font-black gold-gradient uppercase tracking-widest mb-2">
                {paymentMethod === 'manual' ? 'Details Submitted' : 'Booking Confirmed'}
              </h2>
              <p className="text-gray-400 font-light">
                {paymentMethod === 'manual'
                  ? 'Your payment details have been submitted successfully. We will verify and confirm shortly.'
                  : 'A detailed receipt has been sent to your email.'}
              </p>
            </div>

            <div className="bg-black/40 rounded-2xl border border-white/5 p-6 mb-8 space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                <span className="font-royal text-sm text-gray-400 uppercase tracking-widest">
                  Transaction ID
                </span>
                <span className="font-mono text-[#d4af37] font-bold">{bookingId}</span>
              </div>

              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                    Customer
                  </span>
                  <span className="block font-bold">{formData.name}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                    Room
                  </span>
                  <span className="block font-bold">{selectedRoom.name}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                    Date & Time
                  </span>
                  <span className="block font-bold">{formData.date}</span>
                  <span className="text-xs text-gray-400">{formData.timeSlot}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                    Payment Status
                  </span>
                  <span
                    className={`inline-block px-2 py-1 text-[10px] rounded border font-bold ${
                      paymentMethod === 'manual'
                        ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        : 'bg-green-500/10 text-green-500 border-green-500/20'
                    }`}
                  >
                    {paymentMethod === 'manual'
                      ? 'PENDING VERIFICATION'
                      : paymentOption === 'full'
                        ? 'FULL PAYMENT RECEIVED'
                        : 'ADVANCE RECEIVED (50%)'}
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Booking Price</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="gold-gradient uppercase font-royal">Amount Paid Now</span>
                  <span className="gold-gradient">₹{amountToPayNow.toLocaleString()}</span>
                </div>
                {paymentOption === 'half' && (
                  <div className="flex justify-between text-sm text-[#d4af37] pt-2 italic">
                    <span>Balance Due on Visit</span>
                    <span>₹{(totalPrice - amountToPayNow).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 py-4 border border-white/10 rounded-xl hover:bg-white/5 transition-all font-royal text-sm font-bold uppercase tracking-widest"
              >
                <Download size={18} />
                Download PDF
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center gap-2 py-4 bg-[#d4af37] text-black rounded-xl hover:scale-105 transition-all font-royal text-sm font-bold uppercase tracking-widest"
              >
                Return Home
              </button>
            </div>

            <p className="mt-8 text-center text-[10px] text-gray-500 uppercase tracking-[0.2em]">
              Sai Lakshya Talkies & Events • Thank you for choosing royalty.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setStep('details')}
            className="flex items-center gap-2 text-[#d4af37] mb-8 hover:translate-x-[-4px] transition-transform font-royal text-sm font-bold tracking-widest"
          >
            <ArrowLeft size={18} />
            BACK TO DETAILS
          </button>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="glass-card p-8 rounded-2xl border-[#d4af37]/20">
                <h3 className="font-royal text-2xl font-bold mb-8 gold-gradient uppercase tracking-widest flex items-center gap-3">
                  <CreditCard className="text-[#d4af37]" />
                  PAYMENT OPTION
                </h3>

                <div className="flex gap-4 mb-8">
                  <button
                    onClick={() => setPaymentMethod('online')}
                    className={`flex-1 py-3 rounded-xl border-2 font-royal text-[10px] font-bold tracking-widest transition-all ${
                      paymentMethod === 'online'
                        ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]'
                        : 'border-white/10 text-gray-500 hover:border-white/20'
                    }`}
                  >
                    ONLINE (QR/UPI)
                  </button>
                  <button
                    onClick={() => setPaymentMethod('manual')}
                    className={`flex-1 py-3 rounded-xl border-2 font-royal text-[10px] font-bold tracking-widest transition-all ${
                      paymentMethod === 'manual'
                        ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]'
                        : 'border-white/10 text-gray-500 hover:border-white/20'
                    }`}
                  >
                    MANUAL (GOOGLE FORM)
                  </button>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => setPaymentOption('full')}
                    className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
                      paymentOption === 'full'
                        ? 'border-[#d4af37] bg-[#d4af37]/5'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-royal font-bold tracking-widest">
                        100% FULL PAYMENT
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentOption === 'full' ? 'border-[#d4af37]' : 'border-gray-600'}`}
                      >
                        {paymentOption === 'full' && (
                          <div className="w-2 h-2 bg-[#d4af37] rounded-full" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 font-light mb-4">
                      Pay full amount now for a seamless check-in experience.
                    </p>
                    <span className="text-2xl font-black font-royal">
                      ₹{totalPrice.toLocaleString()}
                    </span>
                  </button>

                  <button
                    onClick={() => setPaymentOption('half')}
                    className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
                      paymentOption === 'half'
                        ? 'border-[#d4af37] bg-[#d4af37]/5'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-royal font-bold tracking-widest">
                        50% ADVANCE PAYMENT
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentOption === 'half' ? 'border-[#d4af37]' : 'border-gray-600'}`}
                      >
                        {paymentOption === 'half' && (
                          <div className="w-2 h-2 bg-[#d4af37] rounded-full" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 font-light mb-4">
                      Pay half now and remaining balance in cash on your visit.
                    </p>
                    <span className="text-2xl font-black font-royal">
                      ₹{(totalPrice * 0.5).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#d4af37] ml-2 uppercase font-bold tracking-widest">
                      Advance Only
                    </span>
                  </button>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border-blue-500/20 flex gap-4 items-start bg-blue-500/5">
                <ShieldCheck className="text-blue-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm mb-1">SECURE PAYMENT GATEWAY</h4>
                  <p className="text-xs text-gray-400 font-light leading-relaxed">
                    All transactions are encrypted and secured. Your data is handled according to
                    the highest industry standards.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-3xl border-[#d4af37]/50 border-t-4 royal-shadow flex flex-col items-center">
              <h3 className="font-royal text-xl font-bold mb-8 gold-gradient uppercase tracking-widest text-center">
                {paymentMethod === 'online' ? 'Scan to Pay' : 'Manual Payment'}
              </h3>

              {paymentMethod === 'online' ? (
                <>
                  <div className="relative group mb-8">
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#bf953f] to-[#aa771c] rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-white p-4 rounded-xl shadow-2xl">
                      {/* Simulated QR Code for Sai Lakshya */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=sailakshya@upi&pn=Sai%20Lakshya%20Talkies&am=${amountToPayNow}&cu=INR`}
                        alt="Payment QR"
                        className="w-48 h-48 md:w-64 md:h-64"
                      />
                    </div>
                  </div>

                  <div className="w-full space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-grow bg-white/10"></div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                        Or Pay with Apps
                      </span>
                      <div className="h-px flex-grow bg-white/10"></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {['Google Pay', 'PhonePe', 'Paytm'].map(app => (
                        <button key={app} className="flex flex-col items-center gap-2 group">
                          <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center group-hover:bg-[#d4af37]/10 group-hover:border-[#d4af37] transition-all">
                            <Smartphone
                              size={20}
                              className="text-gray-400 group-hover:text-[#d4af37]"
                            />
                          </div>
                          <span className="text-[10px] text-gray-500 group-hover:text-white transition-colors">
                            {app}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-8 border-t border-white/10 text-center">
                      <div className="mb-6">
                        <span className="block text-xs text-gray-500 uppercase tracking-widest mb-1">
                          Payable Amount
                        </span>
                        <span className="block text-4xl font-black font-royal gold-gradient">
                          ₹{amountToPayNow.toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={handleFinalSubmit}
                        disabled={isSubmitting}
                        className={`w-full py-5 bg-gradient-to-r from-[#bf953f] to-[#aa771c] text-black font-royal font-black text-xl tracking-[0.2em] rounded-2xl transition-all duration-300 transform ${
                          isSubmitting
                            ? 'opacity-70 scale-95'
                            : 'hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(191,149,63,0.3)]'
                        }`}
                      >
                        {isSubmitting ? 'VERIFYING...' : 'I HAVE PAID'}
                      </button>
                      <p className="text-[9px] text-gray-500 mt-4 uppercase tracking-widest font-light">
                        Click &quot;I Have Paid&quot; after completing the transaction in your app.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full space-y-6 text-center">
                  <div className="p-6 bg-[#d4af37]/5 rounded-2xl border border-[#d4af37]/20 mb-8">
                    <div className="w-16 h-16 bg-[#d4af37]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ReceiptText className="text-[#d4af37]" size={32} />
                    </div>
                    <h4 className="font-royal font-bold gold-gradient mb-4 uppercase tracking-widest">
                      Manual Verification
                    </h4>
                    <p className="text-xs text-gray-400 font-light leading-relaxed mb-6">
                      Please fill out our Google Form to submit your payment details (Transaction ID
                      & Screenshot). We will verify your payment and confirm your booking.
                    </p>
                    <button
                      onClick={() =>
                        window.open(
                          'https://docs.google.com/forms/d/e/1FAIpQLScH0jiZFr_hVkdlgZBZ4zvZpyztY2LufV4z2kAbkwSvYFtSJw/viewform?usp=publish-editor',
                          '_blank'
                        )
                      }
                      className="w-full py-4 bg-white/5 border border-[#d4af37] text-[#d4af37] font-royal font-bold text-sm tracking-widest rounded-xl hover:bg-[#d4af37] hover:text-black transition-all mb-4"
                    >
                      PAY VIA GOOGLE FORM
                    </button>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">
                      Form collects: Name, Phone, ID & Screenshot
                    </p>
                  </div>

                  <div className="pt-8 border-t border-white/10">
                    <div className="mb-6">
                      <span className="block text-xs text-gray-500 uppercase tracking-widest mb-1">
                        Payable Amount
                      </span>
                      <span className="block text-4xl font-black font-royal gold-gradient">
                        ₹{amountToPayNow.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting}
                      className={`w-full py-5 bg-gradient-to-r from-[#bf953f] to-[#aa771c] text-black font-royal font-black text-xl tracking-[0.2em] rounded-2xl transition-all duration-300 transform ${
                        isSubmitting
                          ? 'opacity-70 scale-95'
                          : 'hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(191,149,63,0.3)]'
                      }`}
                    >
                      {isSubmitting ? 'SUBMITTING...' : 'I HAVE SUBMITTED THE FORM'}
                    </button>
                    <p className="text-[9px] text-gray-500 mt-4 uppercase tracking-widest font-light">
                      Click only after you have completed the Google Form.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-royal text-5xl font-black gold-gradient uppercase tracking-widest mb-4">
            Royal Booking
          </h1>
          <p className="text-gray-400 font-light text-lg">
            Reserve your private sanctuary in just a few clicks.
          </p>
        </div>

        <form onSubmit={proceedToPayment} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8 rounded-2xl border-[#d4af37]/20">
              <h3 className="font-royal text-2xl font-bold mb-6 flex items-center gap-3 uppercase tracking-widest">
                <User className="text-[#d4af37]" />
                PERSONAL DETAILS
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-xs tracking-widest uppercase mb-2 font-bold">
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      size={18}
                    />
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:border-[#d4af37] outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs tracking-widest uppercase mb-2 font-bold">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      size={18}
                    />
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit number"
                      className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:border-[#d4af37] outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-400 text-xs tracking-widest uppercase mb-2 font-bold">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      size={18}
                    />
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:border-[#d4af37] outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-2xl border-[#d4af37]/20">
              <h3 className="font-royal text-2xl font-bold mb-6 flex items-center gap-3 uppercase tracking-widest">
                <Calendar className="text-[#d4af37]" />
                SESSION DETAILS
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-xs tracking-widest uppercase mb-2 font-bold">
                    Select Room
                  </label>
                  <select
                    name="roomId"
                    value={formData.roomId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:border-[#d4af37] outline-none transition-colors appearance-none"
                  >
                    {rooms.map(room => (
                      <option key={room.roomId} value={room.roomId} className="bg-[#1a0000]">
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs tracking-widest uppercase mb-2 font-bold">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      size={18}
                    />
                    <input
                      required
                      type="date"
                      name="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:border-[#d4af37] outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs tracking-widest uppercase mb-2 font-bold">
                    Time Slot (3 Hours)
                  </label>
                  <div className="relative">
                    <Clock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      size={18}
                    />
                    <select
                      name="timeSlot"
                      value={formData.timeSlot}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:border-[#d4af37] outline-none transition-colors appearance-none"
                    >
                      {TIME_SLOTS.map(slot => (
                        <option key={slot} value={slot} className="bg-[#1a0000]">
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs tracking-widest uppercase mb-2 font-bold">
                      Adults
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedRoom.maxCapacity}
                      name="adults"
                      value={formData.adults}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:border-[#d4af37] outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs tracking-widest uppercase mb-2 font-bold">
                      Children
                    </label>
                    <input
                      type="number"
                      min="0"
                      name="children"
                      value={formData.children}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:border-[#d4af37] outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-2xl border-[#d4af37]/20">
              <h3 className="font-royal text-2xl font-bold mb-6 flex items-center gap-3 uppercase tracking-widest">
                <Sparkles className="text-[#d4af37]" />
                ROYAL ADD-ONS
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ADDONS.map(addon => (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col justify-between h-32 ${
                      formData.selectedAddons.includes(addon.id)
                        ? 'bg-[#d4af37]/10 border-[#d4af37]'
                        : 'bg-black/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <span className="block font-bold text-sm mb-1 uppercase tracking-widest">
                        {addon.name}
                      </span>
                      <span className="block text-gray-500 text-xs leading-tight font-light">
                        {addon.description}
                      </span>
                    </div>
                    <span className="block text-[#d4af37] font-royal font-bold tracking-widest">
                      ₹{addon.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="glass-card p-8 rounded-2xl border-[#d4af37]/50 border-t-4 royal-shadow overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37] opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl"></div>

                <h3 className="font-royal text-2xl font-black mb-6 gold-gradient uppercase text-center tracking-widest">
                  Summary
                </h3>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-light">Room Base Price</span>
                    <span className="text-white font-medium">
                      ₹{selectedRoom.price.toLocaleString()}
                    </span>
                  </div>

                  {formData.adults + formData.children > selectedRoom.basePackage && (
                    <div className="p-3 bg-[#d4af37]/5 rounded-lg border border-[#d4af37]/10 space-y-2">
                      <span className="text-[10px] font-royal text-[#d4af37] tracking-[0.2em] block mb-2 uppercase font-bold">
                        Extra Guests
                      </span>
                      {formData.adults > selectedRoom.basePackage && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">
                            Adults ({formData.adults - selectedRoom.basePackage})
                          </span>
                          <span>
                            ₹
                            {(formData.adults - selectedRoom.basePackage) *
                              selectedRoom.extraAdultCharge}
                          </span>
                        </div>
                      )}
                      {formData.children > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Children ({formData.children})</span>
                          <span>₹{formData.children * selectedRoom.extraChildCharge}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {formData.selectedAddons.length > 0 && (
                    <div className="pt-4 border-t border-white/5 space-y-2">
                      <span className="text-[10px] font-royal text-[#d4af37] tracking-[0.2em] block uppercase font-bold">
                        Selected Add-ons
                      </span>
                      {formData.selectedAddons.map(id => {
                        const addon = ADDONS.find(a => a.id === id);
                        return (
                          <div key={id} className="flex justify-between text-sm">
                            <span className="text-gray-400 font-light">{addon?.name}</span>
                            <span>₹{addon?.price}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-[#d4af37]/30 flex justify-between items-center mb-8">
                  <span className="font-royal text-xl font-bold tracking-widest">TOTAL</span>
                  <span className="font-royal text-3xl font-black gold-gradient">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#bf953f] to-[#aa771c] text-black font-royal font-black text-lg tracking-[0.2em] rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 royal-shadow"
                >
                  PROCEED TO PAYMENT
                </button>

                <p className="text-[10px] text-gray-500 text-center mt-6 uppercase tracking-[0.2em] leading-relaxed">
                  Private entertainment reimagined.
                </p>
              </div>

              <div className="glass-card p-6 rounded-2xl border-white/5 flex gap-4 items-start">
                <Info className="text-[#d4af37] shrink-0" size={20} />
                <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed">
                  Cancellation: 50% refund 24h prior. No refunds same-day.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
