const statusConfig = {
  pending: { label: 'En attente', className: 'badge-pending' },
  approved: { label: 'Approuvé', className: 'badge-approved' },
  rejected: { label: 'Rejeté', className: 'badge-rejected' },
  confirmed: { label: 'Confirmé', className: 'badge-confirmed' },
  completed: { label: 'Terminé', className: 'badge-completed' },
  cancelled: { label: 'Annulé', className: 'badge-cancelled' },
  accepted: { label: 'Accepté', className: 'badge-accepted' },
  draft: { label: 'Brouillon', className: 'badge-draft' },
  paid: { label: 'Payé', className: 'badge-confirmed' },
  unpaid: { label: 'Non payé', className: 'badge-pending' },
  refunded: { label: 'Remboursé', className: 'badge-cancelled' },
  hidden: { label: 'Masqué', className: 'badge-cancelled' },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || { label: status, className: 'badge-pending' };
  return <span className={config.className}>{config.label}</span>;
};

export default StatusBadge;
