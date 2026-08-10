import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import { ToastProvider } from './components/ToastProvider';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import OwnerLayout from './layouts/OwnerLayout';
import AdminLayout from './layouts/AdminLayout';

// Public pages
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import ContactPage from './pages/ContactPage';
import CategoriesPage from './pages/CategoriesPage';
import ProductsPage from './pages/ProductsPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import BoatListPage from './pages/boats/BoatListPage';
import BoatDetailPage from './pages/boats/BoatDetailPage';
import LegalPage from './pages/legal/LegalPage';
import MvpLimitationsPage from './pages/MvpLimitationsPage';

// Protected pages
import ProfilePage from './pages/profile/ProfilePage';
import MyBookingsPage from './pages/bookings/MyBookingsPage';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentCancel from './pages/payment/PaymentCancel';

// Owner pages
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import OwnerBoatsPage from './pages/owner/OwnerBoatsPage';
import OwnerBoatFormPage from './pages/owner/OwnerBoatFormPage';
import OwnerBookingsPage from './pages/owner/OwnerBookingsPage';
import OwnerDocumentsPage from './pages/owner/OwnerDocumentsPage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminBoatsPage from './pages/admin/AdminBoatsPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminDocumentsPage from './pages/admin/AdminDocumentsPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminActionLogsPage from './pages/admin/AdminActionLogsPage';
import AdminEmailSettingsPage from './pages/admin/AdminEmailSettingsPage';
import AdminContactMessagesPage from './pages/admin/AdminContactMessagesPage';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const language = (i18n.resolvedLanguage || i18n.language || 'fr').split('-')[0];
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language, i18n.resolvedLanguage]);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<BoatDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/boats" element={<BoatListPage />} />
              <Route path="/boats/:identifier" element={<BoatDetailPage />} />
              <Route path="/bateaux/:slug" element={<BoatDetailPage />} />
              <Route path="/legal/:slug" element={<LegalPage />} />
              <Route path="/mvp-limitations" element={<MvpLimitationsPage />} />

              {/* Protected public routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment/success"
                element={
                  <ProtectedRoute>
                    <PaymentSuccess />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment/cancel"
                element={
                  <ProtectedRoute>
                    <PaymentCancel />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Owner routes */}
            <Route
              path="/owner"
              element={
                <RoleRoute roles={['owner']}>
                  <OwnerLayout />
                </RoleRoute>
              }
            >
              <Route path="dashboard" element={<OwnerDashboardPage />} />
              <Route path="boats" element={<OwnerBoatsPage />} />
              <Route path="boats/new" element={<OwnerBoatFormPage />} />
              <Route path="boats/:id/edit" element={<OwnerBoatFormPage />} />
              <Route path="bookings" element={<OwnerBookingsPage />} />
              <Route path="documents" element={<OwnerDocumentsPage />} />
            </Route>

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <RoleRoute roles={['admin']}>
                  <AdminLayout />
                </RoleRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="boats" element={<AdminBoatsPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="documents" element={<AdminDocumentsPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="contact-messages" element={<AdminContactMessagesPage />} />
              <Route path="email-settings" element={<AdminEmailSettingsPage />} />
              <Route path="action-logs" element={<AdminActionLogsPage />} />
            </Route>
          </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
