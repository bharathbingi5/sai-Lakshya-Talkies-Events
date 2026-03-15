
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Crown, X, CheckCircle, Info, Sparkles } from 'lucide-react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BookingPage from './pages/BookingPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { AdminCredentials } from './types';

// Toast Context
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info';
  title: string;
}

interface ToastContextType {
  showToast: (title: string, message: string, type?: 'success' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const showToast = (title: string, message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAdminLogin = (creds: AdminCredentials) => {
    localStorage.setItem('admin_token', creds.token);
    setIsAdminLoggedIn(true);
    showToast('Access Granted', `Welcome back, ${creds.username}`, 'success');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAdminLoggedIn(false);
    showToast('Logged Out', 'You have been securely logged out.', 'info');
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Router>
        <div className="min-h-screen emerald-bg text-white overflow-x-hidden">
          <Navbar isAdmin={isAdminLoggedIn} onLogout={handleAdminLogout} />
          
          {/* Toast Container */}
          <div className="fixed top-24 right-6 z-[100] flex flex-col gap-4 w-full max-w-sm pointer-events-none">
            {toasts.map((toast) => (
              <div 
                key={toast.id}
                className="pointer-events-auto glass-card border-[#d4af37]/50 border-l-4 p-4 rounded-xl shadow-2xl animate-fade-in-right flex gap-4 items-start relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/5 to-transparent pointer-events-none" />
                <div className={`p-2 rounded-lg ${toast.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {toast.type === 'success' ? <CheckCircle size={20} /> : <Info size={20} />}
                </div>
                <div className="flex-grow">
                  <h4 className="font-royal font-bold text-sm gold-gradient uppercase tracking-widest">{toast.title}</h4>
                  <p className="text-xs text-gray-400 mt-1 font-light leading-relaxed">{toast.message}</p>
                </div>
                <button 
                  onClick={() => removeToast(toast.id)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book" element={<BookingPage />} />
            <Route 
              path="/admin" 
              element={isAdminLoggedIn ? <AdminDashboard /> : <AdminLogin onLogin={handleAdminLogin} />} 
            />
          </Routes>

          <footer className="py-12 px-6 border-t border-[#d4af37]/30 bg-black/50 text-center">
            <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="text-[#d4af37] w-8 h-8" />
                <span className="font-royal text-2xl gold-gradient font-bold tracking-widest">SAI LAKSHYA</span>
              </div>
              <p className="max-w-2xl text-gray-400 font-light leading-relaxed">
                Experience entertainment like never before. From royal celebrations to intimate couple moments, we provide the perfect sanctuary for your special events.
              </p>
              <div className="flex gap-4 text-[#d4af37]">
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
                <span>•</span>
                <Link to="/book" className="hover:text-white transition-colors">Book Now</Link>
                <span>•</span>
                <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
              </div>
              <p className="text-gray-500 text-sm mt-4">
                © 2025 SAI LAKSHYA TALKIES & EVENTS. All Rights Reserved.
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </ToastContext.Provider>
  );
}

export default App;
