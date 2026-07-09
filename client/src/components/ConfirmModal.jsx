import { useEffect, useState } from 'react';

const ConfirmModal = ({ request, onResolve }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(request?.defaultValue || '');
  }, [request]);

  if (!request) return null;

  const isPrompt = request.kind === 'prompt';

  const confirm = () => {
    onResolve(isPrompt ? value : true);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: 'rgba(7,25,46,0.48)' }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl p-6" style={{ boxShadow: '0 24px 70px rgba(7,25,46,0.28)' }}>
        <h2 className="font-bold text-lg mb-2" style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}>
          {request.title || 'Confirmation'}
        </h2>
        <p className="text-sm leading-relaxed mb-5" style={{ color: '#64748B' }}>
          {request.message}
        </p>

        {isPrompt && (
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="input-field mb-5"
            rows={3}
            placeholder={request.placeholder || ''}
            autoFocus
          />
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onResolve(false)}
            className="px-5 py-2.5 rounded-full text-sm font-semibold border transition-all hover:bg-[#EDF1F5]"
            style={{ borderColor: 'rgba(7,25,46,0.15)', color: '#07192E' }}
          >
            {request.cancelLabel || 'Annuler'}
          </button>
          <button
            type="button"
            onClick={confirm}
            className="px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:opacity-90"
            style={{ background: request.variant === 'danger' ? '#dc2626' : '#07192E', color: '#fff' }}
          >
            {request.confirmLabel || 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
