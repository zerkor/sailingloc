import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, Ship, XCircle } from 'lucide-react';
import { confirmStripeCheckoutSession } from '../../services/paymentService';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verification du paiement Stripe...');

  useEffect(() => {
    const confirmPayment = async () => {
      if (!sessionId) {
        setStatus('error');
        setMessage('Session Stripe manquante.');
        return;
      }

      try {
        await confirmStripeCheckoutSession(sessionId);
        setStatus('success');
        setMessage('Reservation confirmee. Votre facture PDF a ete generee et envoyee par email.');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || "Impossible de confirmer le paiement pour le moment.");
      }
    };

    confirmPayment();
  }, [sessionId]);

  const Icon = status === 'loading' ? Loader2 : status === 'success' ? CheckCircle2 : XCircle;
  const color = status === 'error' ? '#dc2626' : status === 'success' ? '#16a34a' : '#00C6E0';

  return (
    <section className="section-padding" style={{ background: '#F7F5F2', minHeight: '70vh' }}>
      <div className="container-max">
        <div
          className="bg-white rounded-2xl p-8 max-w-2xl mx-auto text-center"
          style={{ boxShadow: '0 18px 48px rgba(7,25,46,0.12)' }}
        >
          <Icon size={48} className={`mx-auto mb-4 ${status === 'loading' ? 'animate-spin' : ''}`} color={color} />
          <h1
            className="mb-3"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 800, color: '#07192E' }}
          >
            {status === 'success' ? 'Paiement confirme' : 'Paiement en cours de confirmation'}
          </h1>
          <p className="mb-6" style={{ color: '#64748B' }}>
            {message}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/my-bookings" className="btn-primary">
              Voir mes reservations
            </Link>
            <Link to="/boats" className="btn-secondary inline-flex items-center justify-center gap-2">
              <Ship size={18} /> Retour aux bateaux
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentSuccess;
