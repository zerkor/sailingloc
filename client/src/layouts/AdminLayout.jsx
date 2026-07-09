import { Outlet, Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

const AdminLayout = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" style={{ background: '#EDF1F5' }}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="px-4 sm:px-8 py-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between flex-shrink-0"
          style={{
            background: '#fff',
            borderBottom: '1px solid rgba(7,25,46,0.08)',
            boxShadow: '0 1px 12px rgba(7,25,46,0.04)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: '#07192E', color: '#00C6E0' }}
            >
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#07192E' }}>
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs" style={{ color: '#8896A8' }}>
                Administrateur
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
              style={{ color: '#8896A8' }}
            >
              <ArrowLeft size={13} /> Site public
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors hover:bg-red-50"
              style={{ color: '#ef4444' }}
            >
              Déconnexion
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
