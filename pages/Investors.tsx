
import React, { useState, useEffect } from 'react';
import { db } from '../services/dataStore';
import { Plus } from 'lucide-react';
import { InvestorCapital } from '../types';

export const Investors = () => {
  const [investors, setInvestors] = useState<InvestorCapital[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<InvestorCapital>>({
    investorName: '',
    dateReceived: new Date().toISOString().split('T')[0],
    amount: 0,
    instrument: 'iSAFE'
  });

  useEffect(() => {
    const loadInvestors = async () => {
      try {
        const data = await db.getInvestors();
        setInvestors(data);
      } catch (error) {
        console.error("Failed to load investors", error);
      }
    };
    loadInvestors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.investorName && formData.amount) {
       await db.addInvestor(formData as any);
       const updatedInvestors = await db.getInvestors();
       setInvestors(updatedInvestors);
       setShowModal(false);
       setFormData({ investorName: '', dateReceived: new Date().toISOString().split('T')[0], amount: 0, instrument: 'iSAFE' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold text-slate-900">Investor Capital</h2>
            <p className="text-slate-500">Equity and instruments tracking</p>
         </div>
         <button onClick={() => setShowModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 shadow-sm">
            <Plus size={16} />
            <span>Add Investor</span>
          </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">Investor Name</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Date Received</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Instrument</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {investors.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{inv.investorName}</td>
                <td className="px-6 py-4 text-slate-500">{inv.dateReceived}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {inv.instrument}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">₹{inv.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold mb-4">Add New Investor</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Investor Name</label>
                  <input type="text" required 
                    className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-md p-2"
                    value={formData.investorName}
                    onChange={e => setFormData({...formData, investorName: e.target.value})}
                  />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input type="date" required 
                      className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-md p-2"
                      value={formData.dateReceived}
                      onChange={e => setFormData({...formData, dateReceived: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Instrument</label>
                    <select 
                      className="w-full border border-slate-600 bg-slate-700 text-white rounded-md p-2"
                      value={formData.instrument}
                      onChange={e => setFormData({...formData, instrument: e.target.value})}
                    >
                      <option value="iSAFE">iSAFE</option>
                      <option value="Equity">Equity</option>
                      <option value="Grant">Grant</option>
                      <option value="Convertible Note">Convertible Note</option>
                      <option value="CCD">CCD</option>
                    </select>
                 </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                  <input type="number" required min="1"
                    className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-md p-2"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                  />
               </div>

               <div className="flex justify-end space-x-2 mt-6">
                 <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Investor</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
