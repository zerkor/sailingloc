const PaginationControls = ({ page, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-end gap-3 px-4 py-3 bg-white border-t"
      style={{ borderColor: 'rgba(7,25,46,0.08)' }}
      aria-label="Pagination"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label={`Aller a la page precedente, page ${Math.max(page - 1, 1)}`}
        className="px-3 py-1.5 rounded-full text-xs font-bold disabled:opacity-40"
        style={{ background: '#EDF1F5', color: '#07192E' }}
      >
        Precedent
      </button>
      <span className="text-xs font-semibold" style={{ color: '#64748B' }} aria-live="polite">
        Page {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label={`Aller a la page suivante, page ${Math.min(page + 1, totalPages)}`}
        className="px-3 py-1.5 rounded-full text-xs font-bold disabled:opacity-40"
        style={{ background: '#07192E', color: '#fff' }}
      >
        Suivant
      </button>
    </nav>
  );
};

export default PaginationControls;
