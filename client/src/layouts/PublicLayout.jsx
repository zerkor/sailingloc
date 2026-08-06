import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NewsletterSignup from '../components/NewsletterSignup';
import CookieBanner from '../components/CookieBanner';

const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main id="main-content" role="main" className="flex-1">
      <Outlet />
    </main>
    <NewsletterSignup />
    <Footer />
    <CookieBanner />
  </div>
);

export default PublicLayout;
