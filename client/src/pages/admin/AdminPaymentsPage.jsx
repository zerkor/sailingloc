import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import PaginationControls from '../../components/PaginationControls';
import { formatDate } from '../../utils/formatDate';
import { formatPrice } from '../../utils/formatPrice';

const paymentLabel = { requires_capture: 'unpaid', succeeded: 'paid', refunded: 'refunded', failed: 'failed' };

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [paymentStatus, setPaymentStatus] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/payments', { params: { page, limit: 10, paymentStatus: paymentStatus || undefined, bookingStatus: bookingStatus || undefined } });
      setPayments(data.items || []);
      setSummary(data.summary || {});
      setMeta({ page: data.page || page, totalPages: data.totalPages || 1, total: data.total || 0 });
    } finally {
      setLoading(false);
    }
  }, [paymentStatus, bookingStatus]);

  useEffect(() => { fetchPayments(1); }, [fetchPayments]);

  const refund = async (id) => {
    if (!confirm('Rembourser ce paiement ?')) return;
    try {
      await api.patch(`/admin/payments/${id}/refund`);
      await fetchPayments(meta.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Remboursement impossible.');
    }
  };

  if (loading) return <LoadingSpinner text="Chargement des paiements..." />;

  return (
    <div className="space-y-6">
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: '#07192E' }}>Paiements <span style={{ fontSize: 18, color: '#8896A8' }}>({meta.total})</span></h1>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">{[
        ['Total payé', summary.totalPaidRevenue], ['Frais service', summary.totalServiceFees], ['Paiements en attente', summary.pendingPayments], ['Montant remboursé', summary.refundedAmount],
      ].map(([label, value]) => <div key={label} className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}><p className="text-xs uppercase font-bold" style={{ color: '#64748B' }}>{label}</p><p className="text-xl font-bold" style={{ color: '#07192E' }}>{typeof value === 'number' && label !== 'Paiements en attente' ? formatPrice(value) : value || 0}</p></div>)}</div>
      <div className="flex flex-col sm:flex-row gap-3">
        <select className="input-field text-sm" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}><option value="">Tous paiements</option><option value="requires_capture">unpaid</option><option value="succeeded">paid</option><option value="refunded">refunded</option></select>
        <select className="input-field text-sm" value={bookingStatus} onChange={e => setBookingStatus(e.target.value)}><option value="">Tous bookings</option><option value="pending">pending</option><option value="confirmed">confirmed</option><option value="cancelled">cancelled</option><option value="completed">completed</option></select>
      </div>
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}>
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr style={{ background: '#EDF1F5' }}><th className="px-5 py-3 text-left">Booking ID</th><th className="px-5 py-3 text-left">Boat</th><th className="px-5 py-3 text-left">Tenant</th><th className="px-5 py-3 text-left">Owner</th><th className="px-5 py-3 text-left">Amount</th><th className="px-5 py-3 text-left">Service fee</th><th className="px-5 py-3 text-left">Payment status</th><th className="px-5 py-3 text-left">Booking status</th><th className="px-5 py-3 text-left">Created date</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
          <tbody>{payments.length === 0 ? <tr><td colSpan={10} className="text-center py-12" style={{ color: '#8896A8' }}>Aucun paiement.</td></tr> : payments.map(payment => <tr key={payment._id} style={{ borderBottom: '1px solid rgba(7,25,46,0.06)' }}><td className="px-5 py-3">{payment.booking?._id || payment.booking}</td><td className="px-5 py-3">{payment.booking?.boat?.title || 'N/A'}</td><td className="px-5 py-3">{payment.tenant?.firstName} {payment.tenant?.lastName}</td><td className="px-5 py-3">{payment.owner?.firstName} {payment.owner?.lastName}</td><td className="px-5 py-3">{formatPrice(payment.amount)}</td><td className="px-5 py-3">{formatPrice(payment.serviceFee)}</td><td className="px-5 py-3">{paymentLabel[payment.status] || payment.status}</td><td className="px-5 py-3">{payment.booking?.status || '-'}</td><td className="px-5 py-3">{formatDate(payment.createdAt)}</td><td className="px-5 py-3 text-right">{payment.status === 'succeeded' && <button onClick={() => refund(payment._id)} className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>Refund</button>}</td></tr>)}</tbody>
        </table></div>
        <PaginationControls page={meta.page} totalPages={meta.totalPages} onPageChange={fetchPayments} />
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
