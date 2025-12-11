
import React, { useState } from 'react';
import { db } from '../services/dataStore';
import { Grant, PERMISSIONS } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Plus } from 'lucide-react';

export const Grants = () => {
  const { user } = useAuth();
  const [grants, setGrants] = useState(db.getGrants());
  const [showModal, setShowModal] = useState(false);
  
  const canEdit = user?.permissions.includes(PERMISSIONS.MANAGE_GRANTS);

  const [formData, setFormData] = useState<Partial<Grant>>({
    name: '',
    totalSanctioned: 0,
    amountReceived: 0,
    deadline: '',
    amountUtilized: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.totalSanctioned) {
       await db.addGrant(formData as any);
       setGrants(db.getGrants());
       setShowModal(false);
       setFormData({ name: '', totalSanctioned: 0, amountReceived: 0, deadline: '', amountUtilized: 0 });
    }
  };

  const calculateProgress = (received: number, sanctioned: number) => {
    return sanctioned > 0 ? (received / sanctioned) * 100 : 0;
  };

  const calculateUtilized = (utilized: number, received: number) => {
    return received > 0 ? (utilized / received) * 100 : 0;
  };

  const currency = (n: number) => `₹${n.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold text-slate-900">Grants Management</h2>
            <p className="text-slate-500">Track grant milestones and utilization</p>
         </div>
         {canEdit && (
           <button onClick={() => setShowModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
             <Plus size={16} />
             <span>Add Grant</span>
           </button>
         )}
      </div>

      <div className="grid gap-6">
        {grants.map((grant) => (
          <div key={grant.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{grant.name}</h3>
                <p className="text-sm text-slate-500">Deadline: {grant.deadline}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">Active</span>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Total Sanctioned</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{currency(grant.totalSanctioned)}</p>
              </div>
               <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Received</p>
                <p className="text-2xl font-bold text-slate-700 mt-1">{currency(grant.amountReceived)}</p>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                   <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${calculateProgress(grant.amountReceived, grant.totalSanctioned)}%` }}></div>
                </div>
              </div>
               <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Utilized</p>
                <p className="text-2xl font-bold text-slate-700 mt-1">{currency(grant.amountUtilized)}</p>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                   <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${calculateUtilized(grant.amountUtilized, grant.amountReceived)}%` }}></div>
                </div>
                <p className="text-xs text-slate-400 mt-1">{calculateUtilized(grant.amountUtilized, grant.amountReceived).toFixed(1)}% of received funds</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && canEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <h3 className="text-lg font-bold mb-4">Add New Grant</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Grant Name</label>
                   <input type="text" required 
                     className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-md p-2"
                     value={formData.name}
                     onChange={e => setFormData({...formData, name: e.target.value})}
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Sanctioned Amount</label>
                     <input type="number" required 
                       className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-md p-2"
                       value={formData.totalSanctioned}
                       onChange={e => setFormData({...formData, totalSanctioned: parseFloat(e.target.value)})}
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Received Amount</label>
                     <input type="number" required 
                       className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-md p-2"
                       value={formData.amountReceived}
                       onChange={e => setFormData({...formData, amountReceived: parseFloat(e.target.value)})}
                     />
                  </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
                   <input type="date" required 
                     className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-md p-2"
                     value={formData.deadline}
                     onChange={e => setFormData({...formData, deadline: e.target.value})}
                   />
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Grant</button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};