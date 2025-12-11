
import React, { useState } from 'react';
import { db } from '../services/dataStore';
import { Users, Plus, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Headcount as HeadcountType, PERMISSIONS } from '../types';

export const Headcount = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState(db.getHeadcount());
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const canEdit = user?.permissions.includes(PERMISSIONS.MANAGE_HEADCOUNT);

  const [formData, setFormData] = useState<Partial<HeadcountType>>({
    name: '',
    role: '',
    ctcMonthly: 0,
    startDate: '',
    allocationPercent: 100
  });

  const handleEdit = (member: HeadcountType) => {
    setFormData(member);
    setEditingId(member.id);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setFormData({
      name: '',
      role: '',
      ctcMonthly: 0,
      startDate: new Date().toISOString().split('T')[0],
      allocationPercent: 100
    });
    setEditingId(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
       await db.updateHeadcount(editingId, formData);
    } else {
       await db.addHeadcount(formData as any);
    }
    setTeam(db.getHeadcount());
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold text-slate-900">Headcount</h2>
            <p className="text-slate-500">Team allocations and payroll</p>
         </div>
         {canEdit && (
           <button onClick={handleAddNew} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
             <Plus size={16} />
             <span>Add Member</span>
           </button>
         )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member) => (
          <div key={member.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
             <div className="flex items-start space-x-4">
               <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                 <Users size={24} />
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-slate-900">{member.name}</h3>
                 <p className="text-sm text-indigo-600 font-medium">{member.role}</p>
                 <div className="mt-3 text-sm text-slate-500 space-y-1">
                   <p>Monthly CTC: ₹{member.ctcMonthly.toLocaleString()}</p>
                   <p>Joined: {member.startDate}</p>
                   <div className="flex items-center mt-2">
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">Alloc: {member.allocationPercent}%</span>
                   </div>
                 </div>
               </div>
             </div>
             {canEdit && (
               <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                  <button onClick={() => handleEdit(member)} className="text-slate-400 hover:text-indigo-600 text-sm flex items-center space-x-1">
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
               </div>
             )}
          </div>
        ))}
      </div>

      {showModal && canEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Member' : 'Add Team Member'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                   <input type="text" required 
                     className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-md p-2"
                     value={formData.name}
                     onChange={e => setFormData({...formData, name: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                   <input type="text" required 
                     className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-md p-2"
                     value={formData.role}
                     onChange={e => setFormData({...formData, role: e.target.value})}
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Monthly CTC</label>
                     <input type="number" required 
                       className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-md p-2"
                       value={formData.ctcMonthly}
                       onChange={e => setFormData({...formData, ctcMonthly: parseFloat(e.target.value)})}
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                     <input type="date" required 
                       className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-md p-2"
                       value={formData.startDate}
                       onChange={e => setFormData({...formData, startDate: e.target.value})}
                     />
                  </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Allocation %</label>
                   <input type="number" required min="0" max="100"
                     className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-md p-2"
                     value={formData.allocationPercent}
                     onChange={e => setFormData({...formData, allocationPercent: parseFloat(e.target.value)})}
                   />
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};