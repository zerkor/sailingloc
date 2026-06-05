import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import OwnerLayout from './layouts/OwnerLayout';
import AdminLayout from './layouts/AdminLayout';

// Public pages
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import BoatListPage from './pages/boats/BoatListPage';
import BoatDetailPage from './pages/boats/BoatDetailPage';
import LegalPage from './pages/legal/LegalPage';

// Protected pages
import ProfilePage from './pages/profile/ProfilePage';
import MyBookingsPage from './pages/bookings/MyBookingsPage';

// Owner pages
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import OwnerBoatsPage from './pages/owner/OwnerBoatsPage';
import OwnerBoatFormPage from './pages/owner/OwnerBoatFormPage';
import OwnerBookingsPage from './pages/owner/OwnerBookingsPage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminBoatsPage from './pages/admin/AdminBoatsPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/boats" element={<BoatListPage />} />
            <Route path="/boats/:id" element={<BoatDetailPage />} />
            <Route path="/legal/:slug" element={<LegalPage />} />

            {/* Protected public routes */}
            <Route path="/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />
            <Route path="/my-bookings" element={
              <ProtectedRoute><MyBookingsPage /></ProtectedRoute>
            } />

            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Owner routes */}
          <Route path="/owner" element={
            <RoleRoute roles={['owner']}>
              <OwnerLayout />
            </RoleRoute>
          }>
            <Route path="dashboard" element={<OwnerDashboardPage />} />
            <Route path="boats" element={<OwnerBoatsPage />} />
            <Route path="boats/new" element={<OwnerBoatFormPage />} />
            <Route path="boats/:id/edit" element={<OwnerBoatFormPage />} />
            <Route path="bookings" element={<OwnerBookingsPage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={
            <RoleRoute roles={['admin']}>
              <AdminLayout />
            </RoleRoute>
          }>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="boats" element={<AdminBoatsPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
