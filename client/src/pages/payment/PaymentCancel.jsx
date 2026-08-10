import { Link, useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import SEO from '../../components/SEO';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  return (
    <section className="section-padding" style={{ background: '#F7F5F2', minHeight: '70vh' }}>
      <SEO title="Paiement annulé — SailingLoc" description="Page privée de paiement annulé SailingLoc." noIndex />
      <div className="container-max">
        <div className="bg-white rounded-2xl p-8 max-w-2xl mx-auto text-center" style={{ boxShadow: '0 18px 48px rgba(7,25,46,0.12)' }}>
          <XCircle size={48} className="mx-auto mb-4" color="#dc2626" />
          <h1 className="mb-3" style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 800, color: '#07192E' }}>
            Paiement annulé
          </h1>
          <p className="mb-6" style={{ color: '#64748B' }}>
            Aucun paiement n'a été validé. Vous pouvez revenir à vos réservations et relancer le paiement quand vous le souhaitez.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/my-bookings" className="btn-primary">
              Réessayer le paiement
            </Link>
            {bookingId && (
              <Link to="/boats" className="btn-secondary">
                Voir les bateaux
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentCancel;
