import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/dataStore';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';

export const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
       setError("Password must be at least 6 characters");
       return;
    }

    setLoading(true);
    try {
      if (user) {
        await db.changePassword(user.id, newPassword);
        // Update local session
        login({ ...user, isFirstLogin: false });
        navigate('/');
      }
    } catch (err) {
      setError("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
       <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
         <div className="text-center mb-6">
           <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <ShieldCheck size={24} />
           </div>
           <h2 className="text-xl font-bold text-slate-900">Security Update</h2>
           <p className="text-slate-500 text-sm mt-1">Please set a new password for your account to continue.</p>
         </div>

         {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="New password"
                    required
                  />
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex justify-center items-center mt-4"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'}
            </button>
         </form>
       </div>
    </div>
  );
};