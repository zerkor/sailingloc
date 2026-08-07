import { useCallback, useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import PaginationControls from '../../components/PaginationControls';
import { formatDate } from '../../utils/formatDate';
import { formatPrice } from '../../utils/formatPrice';
import { useUiFeedback } from '../../components/ToastProvider';

const paymentLabel = {
  unpaid: 'Non payé',
  pending: 'En attente',
  paid: 'Payé',
  requires_capture: 'Non payé',
  succeeded: 'Payé',
  refunded: 'Remboursé',
  failed: 'Échec',
};

const AdminPaymentsPage = () => {
  const { toast, requestApproval } = useUiFeedback();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [paymentStatus, setPaymentStatus] = useState('');
  const [provider, setProvider] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const { data } = await api.get('/admin/payments', {
          params: {
            page,
            limit: 10,
            paymentStatus: paymentStatus || undefined,
            provider: provider || undefined,
            bookingStatus: bookingStatus || undefined,
          },
        });
        setPayments(data.items || []);
        setSummary(data.summary || {});
        setMeta({ page: data.page || page, totalPages: data.totalPages || 1, total: data.total || 0 });
      } finally {
        setLoading(false);
      }
    },
    [paymentStatus, provider, bookingStatus]
  );

  useEffect(() => {
    fetchPayments(1);
  }, [fetchPayments]);

  const refund = async (id) => {
    if (
      !(await requestApproval('Rembourser ce paiement ?', {
        title: 'Remboursement',
        variant: 'danger',
        confirmLabel: 'Rembourser',
      }))
    )
      return;
    try {
      await api.patch(`/admin/payments/${id}/refund`);
      await fetchPayments(meta.page);
      toast('Paiement remboursé.', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Remboursement impossible.', 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Chargement des paiements..." />;

  return (
    <div className="space-y-6">
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: '#07192E' }}>
        Paiements <span style={{ fontSize: 18, color: '#8896A8' }}>({meta.total})</span>
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          ['Total payé', summary.totalPaidRevenue],
          ['Stripe payé', summary.stripePaidRevenue],
          ['Simulé payé', summary.simulatedPaidRevenue],
          ['Frais service', summary.totalServiceFees],
          ['Paiements en attente', summary.pendingPayments],
          ['Montant remboursé', summary.refundedAmount],
        ].map(([label, value]) => (
          <div key={label} className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
            <p className="text-xs uppercase font-bold" style={{ color: '#64748B' }}>
              {label}
            </p>
            <p className="text-xl font-bold" style={{ color: '#07192E' }}>
              {typeof value === 'number' && label !== 'Paiements en attente' ? formatPrice(value) : value || 0}
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          className="input-field text-sm"
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
        >
          <option value="">Tous paiements</option>
          <option value="unpaid">Non payé</option>
          <option value="pending">En attente</option>
          <option value="paid">Payé</option>
          <option value="refunded">Remboursé</option>
          <option value="failed">Échec</option>
        </select>
        <select className="input-field text-sm" value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="">Tous fournisseurs</option>
          <option value="stripe">Stripe</option>
          <option value="simulated">Simulé</option>
        </select>
        <select
          className="input-field text-sm"
          value={bookingStatus}
          onChange={(e) => setBookingStatus(e.target.value)}
        >
          <option value="">Tous bookings</option>
          <option value="pending">pending</option>
          <option value="confirmed">confirmed</option>
          <option value="cancelled">cancelled</option>
          <option value="completed">completed</option>
        </select>
      </div>
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#EDF1F5' }}>
                <th className="px-5 py-3 text-left">Booking ID</th>
                <th className="px-5 py-3 text-left">Boat</th>
                <th className="px-5 py-3 text-left">Tenant</th>
                <th className="px-5 py-3 text-left">Owner</th>
                <th className="px-5 py-3 text-left">Amount</th>
                <th className="px-5 py-3 text-left">Service fee</th>
                <th className="px-5 py-3 text-left">Provider</th>
                <th className="px-5 py-3 text-left">Payment status</th>
                <th className="px-5 py-3 text-left">Stripe IDs</th>
                <th className="px-5 py-3 text-left">Booking status</th>
                <th className="px-5 py-3 text-left">Created date</th>
                <th className="px-5 py-3 text-left">Paid / refunded</th>
                <th className="px-5 py-3 text-left">Facture</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={14} className="text-center py-12" style={{ color: '#8896A8' }}>
                    Aucun paiement.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} style={{ borderBottom: '1px solid rgba(7,25,46,0.06)' }}>
                    <td className="px-5 py-3">{payment.booking?._id || payment.booking}</td>
                    <td className="px-5 py-3">{payment.booking?.boat?.title || 'N/A'}</td>
                    <td className="px-5 py-3">
                      {payment.tenant?.firstName} {payment.tenant?.lastName}
                    </td>
                    <td className="px-5 py-3">
                      {payment.owner?.firstName} {payment.owner?.lastName}
                    </td>
                    <td className="px-5 py-3">{formatPrice(payment.amount)}</td>
                    <td className="px-5 py-3">{formatPrice(payment.serviceFee)}</td>
                    <td className="px-5 py-3">{payment.provider === 'stripe' ? 'Stripe' : 'Simulé'}</td>
                    <td className="px-5 py-3">{paymentLabel[payment.status] || payment.status}</td>
                    <td className="px-5 py-3">
                      <div className="text-xs" style={{ color: '#64748B', maxWidth: 220 }}>
                        <div>Session: {payment.stripeCheckoutSessionId || '-'}</div>
                        <div>Intent: {payment.stripePaymentIntentId || '-'}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3">{payment.booking?.status || '-'}</td>
                    <td className="px-5 py-3">{formatDate(payment.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="text-xs" style={{ color: '#64748B' }}>
                        <div>Payé: {payment.paidAt ? formatDate(payment.paidAt) : '-'}</div>
                        <div>Remb.: {payment.refundedAt ? formatDate(payment.refundedAt) : '-'}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {payment.invoiceUrl ? (
                        <a
                          href={payment.invoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
                          style={{ background: '#E8FBFE', color: '#007F94', border: '1px solid rgba(0,198,224,0.22)' }}
                        >
                          <FileText size={13} /> PDF
                        </a>
                      ) : (
                        <span className="text-xs" style={{ color: '#8896A8' }}>
                          -
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {['paid', 'succeeded'].includes(payment.status) && (
                        <button
                          onClick={() => refund(payment._id)}
                          className="text-xs font-bold px-3 py-1.5 rounded-full"
                          style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls page={meta.page} totalPages={meta.totalPages} onPageChange={fetchPayments} />
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
