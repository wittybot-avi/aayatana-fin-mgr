
import React, { useState, useEffect } from 'react';
import { db } from '../services/dataStore';
import { User, PERMISSIONS, WRITE_ACCESS_PERMISSIONS, READ_ONLY_PERMISSIONS, LIMITED_USER_PERMISSIONS } from '../types';
import { Plus, Trash2, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles] = useState(db.getRoles());
  const [showModal, setShowModal] = useState(false);
  
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    role: 'Employee',
    email: '',
    password: '',
    accessLevel: 'READ_ONLY' 
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await db.getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to load users", error);
      }
    };
    loadUsers();
  }, []);

  if (currentUser?.role !== 'Admin') {
     return (
       <div className="flex flex-col items-center justify-center h-96 text-center">
         <AlertTriangle size={48} className="text-orange-500 mb-4" />
         <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
         <p className="text-slate-500 mt-2">You do not have permission to view this page.</p>
       </div>
     );
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    let permissions = READ_ONLY_PERMISSIONS;

    if (newUser.role === 'Employee' || newUser.role === 'Manager') {
       permissions = LIMITED_USER_PERMISSIONS;
    } else if (newUser.accessLevel === 'WRITE') {
       permissions = WRITE_ACCESS_PERMISSIONS;
    }
    
    await db.addUser({
      ...newUser,
      isFirstLogin: true,
      permissions: permissions
    });
    const updatedUsers = await db.getUsers();
    setUsers(updatedUsers);
    setShowModal(false);
    setNewUser({ username: '', name: '', role: 'Employee', email: '', password: '', accessLevel: 'READ_ONLY' });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await db.deleteUser(id);
      const updatedUsers = await db.getUsers();
      setUsers(updatedUsers);
    }
  };

  const toggleWriteAccess = async (user: User) => {
    if (user.role === 'Admin') return; 
    
    const hasWrite = user.permissions.includes(PERMISSIONS.EDIT_TRANSACTIONS);
    // If LIMITED user, don't change to full WRITE, just keep limited
    if (user.role === 'Employee' || user.role === 'Manager') return;

    const newPermissions = hasWrite ? READ_ONLY_PERMISSIONS : WRITE_ACCESS_PERMISSIONS;
    await db.updateUserPermissions(user.id, newPermissions);
    const updatedUsers = await db.getUsers();
    setUsers(updatedUsers);
  };

  const hasWriteAccess = (u: User) => u.permissions.includes(PERMISSIONS.EDIT_TRANSACTIONS);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
            <p className="text-slate-500">Manage system access and privileges</p>
         </div>
         <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-slate-900 text-white rounded-lg flex items-center space-x-2 hover:bg-slate-800">
           <Plus size={16} />
           <span>Add User</span>
         </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">Name / Email</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Username</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Role</th>
              <th className="px-6 py-4 font-semibold text-slate-700">DB Access</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.email || 'No email'}</div>
                </td>
                <td className="px-6 py-4 text-slate-600">{u.username}</td>
                <td className="px-6 py-4">
                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                     ${u.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {u.role}
                   </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                     <span className={`text-xs font-medium ${hasWriteAccess(u) ? 'text-indigo-600' : 'text-slate-500'}`}>
                        {u.role === 'Employee' || u.role === 'Manager' ? 'Limited (Own Data)' : (hasWriteAccess(u) ? 'Read & Write' : 'Read Only')}
                     </span>
                     {(u.role !== 'Admin' && u.role !== 'Employee' && u.role !== 'Manager') && (
                       <button 
                         onClick={() => toggleWriteAccess(u)}
                         className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-indigo-600 transition-colors"
                         title={hasWriteAccess(u) ? "Revoke Write Access" : "Grant Write Access"}
                       >
                         {hasWriteAccess(u) ? <Unlock size={14} /> : <Lock size={14} />}
                       </button>
                     )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {u.isFirstLogin ? 
                    <span className="text-orange-600 text-xs font-medium">Pending Setup</span> : 
                    <span className="text-emerald-600 text-xs font-medium">Active</span>
                  }
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(u.id)} className="text-slate-400 hover:text-red-500" disabled={u.username === 'Admin'}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <h3 className="text-lg font-bold mb-4">Create New User</h3>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                    <input type="text" required 
                      className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg p-2"
                      value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Username</label>
                    <input type="text" required 
                      className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg p-2"
                      value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                   <input type="email" 
                      className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg p-2"
                      value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-slate-600 mb-1">Initial Password</label>
                     <input type="text" required 
                        className="w-full border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg p-2"
                        value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-600 mb-1">Role</label>
                     <select 
                        className="w-full border border-slate-600 bg-slate-700 text-white rounded-lg p-2"
                        value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}
                     >
                       <option value="Founder">Founder</option>
                       <option value="Employee">Employee</option>
                       <option value="Manager">Manager</option>
                       <option value="Admin">Admin</option>
                     </select>
                   </div>
                </div>

                {(newUser.role === 'Founder' || newUser.role === 'Admin') && (
                  <div className="mt-2">
                     <label className="block text-sm font-medium text-slate-600 mb-2">Data Access Level</label>
                     <div className="flex space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name="access" 
                            checked={newUser.accessLevel === 'READ_ONLY'}
                            onChange={() => setNewUser({...newUser, accessLevel: 'READ_ONLY'})}
                            className="text-indigo-600"
                          />
                          <span className="text-sm text-slate-700">Read Only</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name="access" 
                             checked={newUser.accessLevel === 'WRITE'}
                             onChange={() => setNewUser({...newUser, accessLevel: 'WRITE'})}
                             className="text-indigo-600"
                          />
                          <span className="text-sm text-slate-700">Read & Write</span>
                        </label>
                     </div>
                  </div>
                )}
                
                {(newUser.role === 'Employee' || newUser.role === 'Manager') && (
                    <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg mt-2">
                       Employees/Managers are restricted to viewing and adding only their own transactions.
                    </div>
                )}

                <div className="flex justify-end space-x-2 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">Create User</button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
