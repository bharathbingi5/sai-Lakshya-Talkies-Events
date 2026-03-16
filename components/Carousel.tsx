import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Room } from '../types';
import { roomService } from '../src/services';

const Carousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await roomService.getAllRooms();
        setRooms(response.data.rooms);
      } catch (error) {
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    if (rooms.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % rooms.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [rooms]);

  const next = () => setCurrentIndex(prev => (prev + 1) % rooms.length);
  const prev = () => setCurrentIndex(prev => (prev - 1 + rooms.length) % rooms.length);

  if (rooms.length === 0) {
    return (
      <div className="relative w-full h-[70vh] md:h-[90vh] flex items-center justify-center bg-black/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4af37] mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[70vh] md:h-[90vh] overflow-hidden">
      {rooms.map((room, index) => (
        <div
          key={room.roomId}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear scale-110"
            style={{
              backgroundImage: `url(${room.image})`,
              transform: index === currentIndex ? 'scale(1)' : 'scale(1.1)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h2 className="font-royal text-4xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl gold-gradient uppercase tracking-widest">
              {room.name}
            </h2>
            <p className="font-royal text-xl md:text-3xl text-[#d4af37] font-bold tracking-widest">
              Starting from ₹{room.price.toLocaleString()}
            </p>
          </div>
        </div>
      ))}

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 text-white hover:bg-[#d4af37]/50 transition-all border border-[#d4af37]/20"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 text-white hover:bg-[#d4af37]/50 transition-all border border-[#d4af37]/20"
      >
        <ChevronRight size={32} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
        {rooms.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-[#d4af37] scale-125' : 'bg-gray-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
