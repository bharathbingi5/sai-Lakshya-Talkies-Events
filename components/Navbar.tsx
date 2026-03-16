import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Crown, LogOut } from 'lucide-react';

interface NavbarProps {
  isAdmin: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isAdmin, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'ROOMS', path: '/#rooms' },
    { name: 'BOOK NOW', path: '/book' },
  ];

  const handleLinkClick = (path: string) => {
    setIsOpen(false);
    if (path.includes('#')) {
      const id = path.split('#')[1];
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="fixed w-full z-50 transition-all duration-300 bg-black/80 backdrop-blur-md border-b border-[#d4af37]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <Crown
              className="text-[#d4af37] group-hover:rotate-12 transition-transform duration-300"
              size={32}
            />
            <div className="flex flex-col">
              <span className="font-royal text-xl md:text-2xl gold-gradient font-black tracking-widest leading-none">
                SAI LAKSHYA
              </span>
              <span className="text-[10px] text-gray-400 tracking-[0.3em] font-light">
                TALKIES & EVENTS
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => handleLinkClick(link.path)}
                className={`font-royal text-sm tracking-widest transition-colors duration-300 hover:text-[#d4af37] ${
                  location.pathname === link.path ? 'text-[#d4af37]' : 'text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 font-royal text-sm transition-colors"
              >
                <LogOut size={18} />
                LOGOUT
              </button>
            )}
            <Link
              to="/book"
              className="px-6 py-2 bg-gradient-to-r from-[#bf953f] to-[#aa771c] rounded-full font-royal text-sm font-bold tracking-widest text-black hover:scale-105 transition-transform"
            >
              BOOK NOW
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#d4af37] hover:text-white focus:outline-none"
            >
              {isOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-[#d4af37]/20 animate-fade-in-down">
          <div className="px-4 pt-4 pb-8 space-y-4 text-center">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => handleLinkClick(link.path)}
                className="block px-3 py-4 text-xl font-royal text-white hover:text-[#d4af37] transition-colors tracking-widest"
              >
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="block w-full text-center px-3 py-4 text-xl font-royal text-red-400 tracking-widest"
              >
                LOGOUT
              </button>
            )}
            <Link
              to="/book"
              onClick={() => setIsOpen(false)}
              className="block w-full py-4 bg-[#bf953f] text-black font-royal font-bold tracking-widest rounded-lg"
            >
              BOOK NOW
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
