import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/dataStore';
import { Loader2, Lock, Mail, User as UserIcon, ArrowLeft } from 'lucide-react';

export const Login = () => {
  const [view, setView] = useState<'login' | 'forgot' | 'reset-sent'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const user = await db.authenticate(username, password);
      if (user) {
        login(user);
        if (user.isFirstLogin) {
          // Temporarily navigate to dashboard instead of change-password as per bypass request
          navigate('/');
        } else {
          navigate('/');
        }
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const exists = await db.resetPasswordRequest(email);
      // For security, always say "If account exists..." but here we mimic success
      if (exists) {
        setView('reset-sent');
      } else {
        // Mocking behavior
        setView('reset-sent'); 
      }
    } catch (err) {
      setError('Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col md:flex-row">
        
        {/* Form Section */}
        <div className="w-full p-8">
          <div className="text-center mb-8">
             <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">Aayatana</h1>
             <p className="text-xs text-slate-400 font-medium tracking-widest mt-1">FINANCE MANAGER</p>
          </div>

          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Sign In</h2>
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => setView('forgot')}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 transition-colors flex justify-center items-center"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
              </button>
            </form>
          )}

          {view === 'forgot' && (
             <form onSubmit={handleForgotPass} className="space-y-4">
               <button 
                 type="button" 
                 onClick={() => setView('login')}
                 className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-4"
               >
                 <ArrowLeft size={16} className="mr-1"/> Back to Login
               </button>
               
               <h2 className="text-lg font-semibold text-slate-800">Reset Password</h2>
               <p className="text-sm text-slate-500">Enter your email or username to receive recovery instructions.</p>
               
               <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Email / Username</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex justify-center items-center"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
              </button>
             </form>
          )}

          {view === 'reset-sent' && (
            <div className="text-center space-y-4">
               <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                 <Mail size={24} />
               </div>
               <h2 className="text-lg font-semibold text-slate-800">Check your email</h2>
               <p className="text-sm text-slate-500">
                 If an account exists for {email}, we have sent password reset instructions to the registered email address.
               </p>
               <button 
                  type="button" 
                  onClick={() => setView('login')}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Return to Login
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};