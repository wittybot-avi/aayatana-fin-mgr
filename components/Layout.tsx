
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, Users, HandCoins, Building2, Bot, Menu, X, Settings, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link to={to} className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // If no user (e.g. on Login page), just render children (which is the Login page content)
  if (!user) {
    return <>{children}</>;
  }

  const isRestrictedUser = user.role === 'Employee' || user.role === 'Manager';

  const navItems = [];

  if (!isRestrictedUser) {
    navItems.push({ to: '/', icon: LayoutDashboard, label: 'Dashboard' });
  }

  navItems.push({ to: '/transactions', icon: Receipt, label: 'Transactions' });

  if (!isRestrictedUser) {
    navItems.push({ to: '/grants', icon: HandCoins, label: 'Grants' });
    navItems.push({ to: '/investors', icon: Building2, label: 'Capital' });
    navItems.push({ to: '/headcount', icon: Users, label: 'Headcount' });
  }
  
  navItems.push({ to: '/agent', icon: Bot, label: 'Finance Agent' });

  if (user.role === 'Admin') {
    navItems.push({ to: '/admin/users', icon: Settings, label: 'User Management' });
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative z-30 w-64 bg-slate-900 text-white h-full transform transition-transform duration-200 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Aayatana</h1>
            <p className="text-xs text-slate-400">Finance Manager v1</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <SidebarItem 
              key={item.to} 
              to={item.to} 
              icon={item.icon} 
              label={item.label} 
              active={location.pathname === item.to} 
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.role}</p>
            </div>
          </div>
          <div className="flex space-x-1">
            <Link to="/profile" className="flex-1 flex items-center justify-center space-x-2 py-2 text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 rounded transition-colors">
              <UserCircle size={14} />
              <span>Profile</span>
            </Link>
            <button onClick={logout} className="flex-1 flex items-center justify-center space-x-2 py-2 text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 rounded transition-colors">
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="text-slate-600">
            <Menu size={24} />
          </button>
          <span className="font-semibold text-slate-800">Aayatana Tech</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};