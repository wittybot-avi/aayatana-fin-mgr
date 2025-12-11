
import React, { useEffect, useState, useRef } from 'react';
import { db } from '../services/dataStore';
import { Transaction, TransactionType, PaymentMode, ChartOfAccount, PERMISSIONS } from '../types';
import { Plus, Download, Trash2, Search, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canEdit = user?.permissions.includes(PERMISSIONS.EDIT_TRANSACTIONS);

  // Form State
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: TransactionType.OUTFLOW,
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    mode: PaymentMode.ACCOUNT_TRANSFER,
    description: '',
    vendor: '',
    categoryId: 1,
    projectTag: 'Business'
  });

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    // Pass user to getTransactions to enforce RLS
    const txs = await db.getTransactions(user);
    const cats = db.getCategories();
    setTransactions(txs);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleExport = () => {
    const headers = ['Date', 'Type', 'Category', 'Vendor', 'Description', 'Amount', 'Project'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => {
        const cat = categories.find(c => c.id === t.categoryId)?.category || 'Unknown';
        return `${t.date},${t.type},${cat},"${t.vendor || ''}","${t.description}",${t.amount},${t.projectTag || ''}`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      alert(`Simulating import from ${e.target.files[0].name}. (Mock functionality)`);
      // Logic to parse file would go here
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.date || !formData.categoryId || !user) return;
    
    await db.addTransaction({
      ...formData as any,
      userId: user.id
    });
    setShowModal(false);
    fetchData();
    
    // Reset form
    setFormData({
       type: TransactionType.OUTFLOW,
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        mode: PaymentMode.ACCOUNT_TRANSFER,
        description: '',
        vendor: '',
        categoryId: 1,
        projectTag: 'Business'
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure?')) {
      await db.deleteTransaction(id);
      fetchData();
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.vendor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">Transactions</h2>
           <p className="text-slate-500">Manage inflows and outflows</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={handleExport} className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
            <Download size={16} />
            <span>Export</span>
          </button>
          
          {/* Import Button */}
          {canEdit && (
            <>
              <input type="file" ref={fileInputRef} className="hidden" accept=".csv, .xlsx" onChange={handleFileChange} />
              <button onClick={handleImportClick} className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
                <Upload size={16} />
                <span>Import</span>
              </button>
            </>
          )}

          {canEdit && (
            <button onClick={() => setShowModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 shadow-sm">
              <Plus size={16} />
              <span>New Transaction</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search vendor or description..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-white text-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Project</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                <th className="px-6 py-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-600">{t.date}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{t.description}</div>
                    <div className="text-xs text-slate-400">{t.vendor} • {t.mode}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {categories.find(c => c.id === t.categoryId)?.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{t.projectTag || '-'}</td>
                  <td className={`px-6 py-4 text-right font-medium ${t.type === TransactionType.INFLOW ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {t.type === TransactionType.INFLOW ? '+' : '-'} ₹{t.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {canEdit ? (
                      <button onClick={() => handleDelete(t.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && canEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold mb-4">New Transaction</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                   <select 
                     className="w-full border border-slate-600 bg-slate-700 text-white rounded-md p-2"
                     value={formData.type}
                     onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}
                   >
                     <option value="OUTFLOW">Outflow</option>
                     <option value="INFLOW">Inflow</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                   <input type="date" required 
                     className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-md p-2"
                     value={formData.date}
                     onChange={e => setFormData({...formData, date: e.target.value})}
                   />
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input type="text" required 
                  className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-md p-2"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mode</label>
                    <select 
                      className="w-full border border-slate-600 bg-slate-700 text-white rounded-md p-2"
                      value={formData.mode}
                      onChange={e => setFormData({...formData, mode: e.target.value as PaymentMode})}
                    >
                      <option value="UPI">UPI</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Account Transfer">Account Transfer</option>
                      <option value="Other">Other</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vendor</label>
                    <input type="text" 
                      className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-md p-2"
                      value={formData.vendor}
                      onChange={e => setFormData({...formData, vendor: e.target.value})}
                    />
                 </div>
              </div>

               <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select 
                    className="w-full border border-slate-600 bg-slate-700 text-white rounded-md p-2"
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: parseInt(e.target.value)})}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.category} - {c.subcategory}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
                  <input 
                    list="project-options"
                    className="w-full border border-slate-600 bg-slate-700 text-white rounded-md p-2"
                    value={formData.projectTag}
                    onChange={e => setFormData({...formData, projectTag: e.target.value})}
                    placeholder="Select or Type..."
                  />
                  <datalist id="project-options">
                    {db.getProjectTags().map(tag => (
                      <option key={tag} value={tag} />
                    ))}
                  </datalist>
                </div>
               </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};