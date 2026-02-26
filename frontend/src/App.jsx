import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login         from './pages/Login';
import Register      from './pages/Register';
import AdminLogin    from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';

import UserDashboard from './pages/user/Dashboard';
import UserHistory   from './pages/user/History';
import UserBill      from './pages/user/Bill';
import UserProfile   from './pages/user/Profile';

import AdminDashboard from './pages/admin/Dashboard';
import AddTiffin      from './pages/admin/AddTiffin';
import TiffinList     from './pages/admin/TiffinList';
import UsersBills     from './pages/admin/UsersBills';
import AdminProfile   from './pages/admin/Profile';

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-10 h-10 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function UserRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login"          element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register"       element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/admin/login"    element={<PublicRoute><AdminLogin /></PublicRoute>} />
          <Route path="/admin/register" element={<PublicRoute><AdminRegister /></PublicRoute>} />
          <Route path="/dashboard" element={<UserRoute><UserDashboard /></UserRoute>} />
          <Route path="/history"   element={<UserRoute><UserHistory /></UserRoute>} />
          <Route path="/bill"      element={<UserRoute><UserBill /></UserRoute>} />
          <Route path="/profile"   element={<UserRoute><UserProfile /></UserRoute>} />
          <Route path="/admin/dashboard"   element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/add-tiffin"  element={<AdminRoute><AddTiffin /></AdminRoute>} />
          <Route path="/admin/tiffin-list" element={<AdminRoute><TiffinList /></AdminRoute>} />
          <Route path="/admin/users-bills" element={<AdminRoute><UsersBills /></AdminRoute>} />
          <Route path="/admin/profile"     element={<AdminRoute><AdminProfile /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}