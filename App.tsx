
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Grants } from './pages/Grants';
import { Headcount } from './pages/Headcount';
import { FinanceAgent } from './pages/FinanceAgent';
import { Investors } from './pages/Investors';
import { Login } from './pages/Login';
import { ChangePassword } from './pages/ChangePassword';
import { UserProfile } from './pages/UserProfile';
import { AdminUsers } from './pages/AdminUsers';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected Route Wrapper
const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/change-password" element={<RequireAuth><ChangePassword /></RequireAuth>} />
      
      {/* Protected Routes */}
      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/transactions" element={<RequireAuth><Transactions /></RequireAuth>} />
      <Route path="/grants" element={<RequireAuth><Grants /></RequireAuth>} />
      <Route path="/headcount" element={<RequireAuth><Headcount /></RequireAuth>} />
      <Route path="/investors" element={<RequireAuth><Investors /></RequireAuth>} />
      <Route path="/agent" element={<RequireAuth><FinanceAgent /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><UserProfile /></RequireAuth>} />
      <Route path="/admin/users" element={<RequireAuth><AdminUsers /></RequireAuth>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Layout>
          <AppRoutes />
        </Layout>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
