
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/dataStore';
import { Loader2, Lock, Mail, User as UserIcon, ArrowLeft, AlertTriangle, Zap } from 'lucide-react';

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
        navigate('/');
      } else {
        setError('Invalid username or password');
      }
    } catch (err: any) {
      console.error(err);
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
      await db.resetPasswordRequest(email);
      setView('reset-sent'); 
    } catch (err) {
      setError('Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  const quickLoginUsers = [
    { name: 'Admin', user: 'Admin', pass: 'Admin@123', role: 'System Admin', color: 'bg-purple-100 text-purple-700' },
    { name: 'Avinash', user: 'Avinash', pass: 'Avinash@123', role: 'Founder & CEO', color: 'bg-indigo-100 text-indigo-700' },
    { name: 'Vinutha', user: 'Vinutha', pass: 'Vinutha@123', role: 'Co-Founder (Read Only)', color: 'bg-blue-100 text-blue-700' },
    { name: 'Shrikanth', user: 'Shrikanth', pass: 'Shrikanth@123', role: 'Co-Founder (Read Only)', color: 'bg-blue-100 text-blue-700' },
  ];

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Quick Login Side Panel (Desktop) / Top (Mobile) */}
        <div className="w-full md:w-5/12 bg-slate-50 border-r border-slate-100 p-8 flex flex-col justify-center">
           <div className="mb-6">
             <div className="flex items-center space-x-2 text-slate-800 font-bold mb-2">
               <Zap size={20} className="text-yellow-500" />
               <span>Quick Access (Demo)</span>
             </div>
             <p className="text-sm text-slate-500">Select a profile to prefill credentials.</p>
           </div>
           
           <div className="space-y-3">
             {quickLoginUsers.map((u) => (
               <button 
                 key={u.user}
                 onClick={() => fillCredentials(u.user, u.pass)}
                 className={`w-full text-left p-3 rounded-xl border border-transparent hover:border-slate-200 transition-all duration-200 flex items-center space-x-3 group ${username === u.user ? 'bg-white shadow-md border-slate-200 ring-1 ring-indigo-500' : 'hover:bg-white hover:shadow-sm'}`}
               >
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${u.color}`}>
                   {u.name.charAt(0)}
                 </div>
                 <div>
                   <p className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{u.name}</p>
                   <p className="text-xs text-slate-500">{u.role}</p>
                 </div>
               </button>
             ))}
           </div>
        </div>

        {/* Login Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 bg-white">
          <div className="text-center mb-8">
             <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">Aayatana</h1>
             <p className="text-xs text-slate-400 font-medium tracking-widest mt-2 uppercase">Finance Manager v1</p>
          </div>

          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="text-left">
                <h2 className="text-xl font-semibold text-slate-800">Welcome Back</h2>
                <p className="text-sm text-slate-500">Please sign in to your account</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start space-x-2 animate-pulse">
                   <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                   <span>{error}</span>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Username</label>
                <div className="relative group">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => setView('forgot')}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition-all transform active:scale-95 flex justify-center items-center shadow-lg shadow-slate-200"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
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
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
               <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Mail size={32} />
               </div>
               <h2 className="text-xl font-bold text-slate-800">Check your email</h2>
               <p className="text-sm text-slate-500 max-w-xs mx-auto">
                 If an account exists for <strong>{email}</strong>, we have sent password reset instructions to the registered email address.
               </p>
               <button 
                  type="button" 
                  onClick={() => setView('login')}
                  className="inline-block mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-bold"
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
