import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Star, ShieldCheck, Zap, Users, Music, Sparkles } from 'lucide-react';
import Carousel from '../components/Carousel';
import { Room } from '../types';
import { roomService } from '../src/services';

const ParallaxImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let ticking = false;

    const updatePosition = () => {
      if (!imageRef.current) return;

      const rect = imageRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight && rect.bottom > 0) {
        const viewportCenter = windowHeight / 2;
        const elementCenter = rect.top + rect.height / 2;
        const distanceFromCenter = (elementCenter - viewportCenter) / windowHeight;

        // Slightly reduced intensity for a more subtle, high-end feel
        const parallaxFactor = 40;
        const translateY = distanceFromCenter * parallaxFactor;

        // Use translate3d for GPU acceleration and scale(1.2) to ensure coverage
        imageRef.current.style.transform = `scale(1.2) translate3d(0, ${translateY}px, 0)`;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updatePosition);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updatePosition();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="w-full h-full overflow-hidden relative bg-black/40">
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover will-change-transform transition-opacity duration-700 opacity-0"
        onLoad={e => (e.currentTarget.style.opacity = '1')}
        style={{ transform: 'scale(1.2)' }}
      />
    </div>
  );
};

const Home: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await roomService.getAllRooms();
        setRooms(response.data.rooms);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading royal experiences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex flex-col justify-center items-center overflow-hidden">
        <Carousel />

        {/* CTA Overlay */}
        <div className="absolute bottom-24 z-10 flex flex-col items-center animate-bounce-slow">
          <Link
            to="/book"
            className="px-10 py-4 bg-[#d4af37] text-black font-royal font-black text-xl tracking-[0.2em] rounded-full hover:bg-white hover:scale-110 transition-all duration-500 royal-shadow flex items-center gap-3"
          >
            <Sparkles className="animate-pulse" />
            BOOK NOW
          </Link>
        </div>
      </section>

      {/* Stats/Badge Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-12 max-w-7xl mx-auto -mt-10 relative z-20">
        {[
          { label: 'Private Theatres', val: '4+', icon: Music },
          { label: 'Max Guests', val: '100+', icon: Users },
          { label: 'Royal Themes', val: 'Gold', icon: Crown },
          { label: 'Satisfaction', val: '100%', icon: ShieldCheck },
        ].map((stat, i) => (
          <div
            key={i}
            className="glass-card p-6 text-center border-[#d4af37]/30 rounded-xl hover:bg-white/10 transition-colors"
          >
            <stat.icon className="mx-auto text-[#d4af37] mb-2" size={32} />
            <div className="text-2xl font-bold font-royal gold-gradient">{stat.val}</div>
            <div className="text-gray-400 text-xs tracking-widest uppercase">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* About Section */}
      <section
        id="about"
        className="py-24 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center"
      >
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#bf953f] to-[#aa771c] opacity-30 blur-2xl group-hover:opacity-50 transition-opacity"></div>
          <img
            src="https://current-amaranth-705xodyk45.edgeone.app/sai%20lakshya%20logo.jpg"
            alt="Sai Lakshya Events"
            className="relative z-10 rounded-2xl border-2 border-[#d4af37]/50 shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </div>
        <div className="space-y-6">
          <h2 className="font-royal text-5xl font-black gold-gradient leading-tight">
            WATCH • CELEBRATE • FEEL ROYAL
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#bf953f] to-transparent"></div>
          <p className="text-xl text-gray-300 font-light italic leading-relaxed">
            Sai Lakshya Talkies & Events redefine the way you experience private celebrations. We
            bring the luxury of a premium theatre combined with the intimacy of your personal space.
          </p>
          <div className="space-y-4">
            {[
              'Personalized decoration for all occasions',
              'High-end 4K audio-visual experience',
              'Luxury seating and premium amenities',
              'Expert staff and impeccable hospitality',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">
                  <Star size={14} fill="currentColor" />
                </div>
                <span className="text-gray-300 tracking-wide">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-24 px-6 bg-black/30 border-y border-[#d4af37]/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[#d4af37] font-royal tracking-[0.5em] text-sm uppercase">
              Curated Experiences
            </span>
            <h2 className="font-royal text-5xl font-black text-white">CHOOSE YOUR DARBHAR</h2>
            <div className="w-32 h-1 bg-[#d4af37] mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {rooms.map(room => (
              <div
                key={room.roomId}
                className="group glass-card rounded-2xl overflow-hidden border-[#d4af37]/20 flex flex-col hover:border-[#d4af37] transition-all duration-500 hover:shadow-[0_0_30px_rgba(191,149,63,0.15)]"
              >
                {/* Refactored Image Container with Consistent Cinematic Aspect Ratio (16:10) */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <ParallaxImage src={room.image} alt={room.name} />
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-[#d4af37]/30 z-10">
                    <span className="text-[#d4af37] font-royal text-[10px] font-bold tracking-widest uppercase">
                      Max: {room.maxCapacity}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="font-royal text-xl font-bold mb-2 gold-gradient group-hover:scale-105 transition-transform duration-500 origin-left">
                    {room.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-3 font-light leading-relaxed">
                    {room.description}
                  </p>

                  <div className="mt-auto flex flex-col gap-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-gray-400 text-xs line-through opacity-50">
                        ₹{(room.price * 1.2).toFixed(0)}
                      </span>
                      <span className="text-2xl font-bold text-white">
                        ₹{room.price.toLocaleString()}
                      </span>
                      <span className="text-[#d4af37] text-[10px] font-royal tracking-widest uppercase">
                        / Base
                      </span>
                    </div>
                    <Link
                      to="/book"
                      state={{ roomId: room.roomId }}
                      className="w-full py-3 border border-[#d4af37]/50 text-[#d4af37] font-royal font-bold text-sm tracking-widest text-center rounded-lg hover:bg-[#d4af37] hover:text-black hover:border-[#d4af37] transition-all duration-300"
                    >
                      SELECT ROOM
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-6 max-w-7xl mx-auto text-center">
        <h2 className="font-royal text-4xl font-black gold-gradient mb-16 uppercase tracking-widest">
          THE ROYAL PROMISE
        </h2>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              title: 'Privacy First',
              desc: 'Completely private soundproof chambers with exclusive access.',
              icon: ShieldCheck,
            },
            {
              title: 'Premium Tech',
              desc: 'Dolby Atmos Surround and 4K Projection for life-like immersion.',
              icon: Zap,
            },
            {
              title: 'Celebration Ready',
              desc: 'Decorations, cakes, and effects customized for your special day.',
              icon: Sparkles,
            },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-4 group">
              <div className="w-20 h-20 bg-gradient-to-br from-[#bf953f] to-[#001210] rounded-2xl flex items-center justify-center border border-[#d4af37]/40 royal-shadow group-hover:scale-110 transition-transform duration-500">
                <item.icon className="text-[#d4af37]" size={40} />
              </div>
              <h3 className="font-royal text-2xl font-bold text-white tracking-wide">
                {item.title}
              </h3>
              <p className="text-gray-400 font-light leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
