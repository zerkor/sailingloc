import { Link } from 'react-router-dom';
import { CheckCircle2, Ship } from 'lucide-react';

const PaymentSuccess = () => (
  <section className="section-padding" style={{ background: '#F7F5F2', minHeight: '70vh' }}>
    <div className="container-max">
      <div className="bg-white rounded-2xl p-8 max-w-2xl mx-auto text-center" style={{ boxShadow: '0 18px 48px rgba(7,25,46,0.12)' }}>
        <CheckCircle2 size={48} className="mx-auto mb-4" color="#16a34a" />
        <h1 className="mb-3" style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 800, color: '#07192E' }}>
          Paiement en cours de confirmation
        </h1>
        <p className="mb-6" style={{ color: '#64748B' }}>
          Votre paiement a bien été pris en compte par Stripe. La confirmation définitive est effectuée automatiquement
          par notre serveur, puis votre réservation passe en statut confirmé.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link to="/my-bookings" className="btn-primary">
            Voir mes réservations
          </Link>
          <Link to="/boats" className="btn-secondary inline-flex items-center justify-center gap-2">
            <Ship size={18} /> Retour aux bateaux
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default PaymentSuccess;
