import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/dataStore';
import { User, UserIcon, Mail, Phone, Shield, Save, Loader2, Key } from 'lucide-react';

export const UserProfile = () => {
  const { user, refreshUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [passData, setPassData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await db.updateUserProfile(user.id, formData);
      await refreshUser();
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (passData.new !== passData.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    // In a real app we would verify current password on server
    if (passData.new.length < 6) {
       setMessage({ type: 'error', text: 'Password must be 6+ chars' });
       return;
    }

    setLoading(true);
    try {
       await db.changePassword(user.id, passData.new);
       setMessage({ type: 'success', text: 'Password changed successfully' });
       setPassData({ current: '', new: '', confirm: '' });
    } catch (err) {
       setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>

      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
               <UserIcon className="mr-2" size={20} /> Personal Details
             </h3>
             
             <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                     <input type="text" className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg p-2" 
                       value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-600 mb-1">Username</label>
                     <input type="text" disabled className="w-full border border-slate-600 bg-slate-800 text-slate-400 rounded-lg p-2" 
                       value={user?.username}
                     />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                     <div className="relative">
                        <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input type="email" className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg p-2 pl-9" 
                          value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                     </div>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-600 mb-1">Phone</label>
                     <div className="relative">
                        <Phone className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input type="tel" className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg p-2 pl-9" 
                          value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                     </div>
                   </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={loading} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    <span>Save Changes</span>
                  </button>
                </div>
             </form>
          </div>
        </div>

        {/* Security Card */}
        <div className="col-span-1 space-y-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
               <Shield className="mr-2" size={20} /> Security
             </h3>
             <form onSubmit={handleChangePassword} className="space-y-3">
               <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Current Password</label>
                  <input type="password" required className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg p-2" 
                    value={passData.current} onChange={e => setPassData({...passData, current: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">New Password</label>
                  <input type="password" required className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg p-2" 
                    value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Confirm New</label>
                  <input type="password" required className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg p-2" 
                    value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})}
                  />
               </div>
               <button type="submit" disabled={loading} className="w-full flex justify-center items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 mt-2">
                 <Key size={16} />
                 <span>Update Password</span>
               </button>
             </form>
           </div>
        </div>

      </div>
    </div>
  );
};