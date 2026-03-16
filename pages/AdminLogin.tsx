import React, { useState } from 'react';
import { Crown, Lock, User, ChevronRight, AlertCircle } from 'lucide-react';
import { AdminCredentials } from '../types';
import { authService } from '../src/services';

interface AdminLoginProps {
  onLogin: (creds: AdminCredentials) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login({ username, password });
      onLogin({
        username: response.data.user.username,
        token: response.data.token,
      });
    } catch (error) {
      setError((error as any).response?.data?.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

      <div className="relative z-10 max-w-md w-full glass-card p-10 rounded-3xl border-[#d4af37]/50 royal-shadow animate-scale-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#d4af37]/20 rounded-full flex items-center justify-center border border-[#d4af37]/50 mb-4">
            <Crown className="text-[#d4af37]" size={32} />
          </div>
          <h2 className="font-royal text-3xl font-black gold-gradient tracking-widest uppercase">
            Admin Access
          </h2>
          <p className="text-gray-400 text-xs tracking-[0.3em] uppercase mt-2">Private Console</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400 animate-shake">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-xs tracking-widest uppercase mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                required
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/60 border border-white/10 rounded-lg focus:border-[#d4af37] outline-none transition-all text-white"
                placeholder="Enter admin ID"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs tracking-widest uppercase mb-2">
              Security Key
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/60 border border-white/10 rounded-lg focus:border-[#d4af37] outline-none transition-all text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 bg-gradient-to-r from-[#bf953f] to-[#aa771c] text-black font-royal font-black text-lg rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-105 ${isLoading ? 'opacity-70' : 'royal-shadow'}`}
          >
            {isLoading ? 'VERIFYING...' : 'ENTER PORTAL'}
            {!isLoading && <ChevronRight />}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600 text-[10px] tracking-widest uppercase font-light">
          Secure encrypted gateway. IP address is being logged.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
