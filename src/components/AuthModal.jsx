import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, User, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthModal({ isOpen, onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login, register, isLoading } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isRegister) {
        await register(email, password, fullName);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E6E4DE] shadow-2xl max-w-md w-full overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1C2028] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D35400] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">ArchNova Architecture ID</h3>
              <p className="text-[10px] text-gray-400">Secure Architectural Project Workspace</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
              {errorMsg}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="font-semibold text-[#1C2028] block mb-1">Full Name / Studio Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Elena Vance, Architect"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-semibold text-[#1C2028] block mb-1">Professional Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@studio.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#1C2028] block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-[#D35400] hover:bg-[#B84700] text-white font-bold transition shadow-sm disabled:opacity-50 mt-2"
          >
            {isLoading ? "Authenticating..." : isRegister ? "Create Studio Account" : "Sign In to Studio"}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-[11px] text-[#5C626F] hover:text-[#D35400] font-medium"
            >
              {isRegister ? "Already registered? Sign In" : "Need an account? Register Studio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
