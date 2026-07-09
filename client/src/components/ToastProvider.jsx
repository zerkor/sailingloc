import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ConfirmModal from './ConfirmModal';

const ToastContext = createContext(null);

const colors = {
  success: { background: '#ecfdf5', color: '#166534', border: 'rgba(22,163,74,0.25)' },
  error: { background: '#fef2f2', color: '#991b1b', border: 'rgba(220,38,38,0.25)' },
  info: { background: '#eff6ff', color: '#1e3a8a', border: 'rgba(37,99,235,0.22)' },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);

  const toast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3800);
  }, []);

  const ask = useCallback(
    (options) =>
      new Promise((resolve) => {
        setDialog({ ...options, resolve });
      }),
    []
  );

  const requestApproval = useCallback((message, options = {}) => ask({ kind: 'confirm', message, ...options }), [ask]);
  const askText = useCallback((message, options = {}) => ask({ kind: 'prompt', message, ...options }), [ask]);

  const resolveDialog = (result) => {
    dialog?.resolve(result);
    setDialog(null);
  };

  const value = useMemo(() => ({ toast, requestApproval, askText }), [toast, requestApproval, askText]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[110] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((item) => {
          const style = colors[item.type] || colors.info;
          return (
            <div
              key={item.id}
              className="rounded-2xl px-4 py-3 text-sm font-semibold"
              style={{
                background: style.background,
                color: style.color,
                border: `1px solid ${style.border}`,
                boxShadow: '0 12px 32px rgba(7,25,46,0.12)',
              }}
            >
              {item.message}
            </div>
          );
        })}
      </div>
      <ConfirmModal request={dialog} onResolve={resolveDialog} />
    </ToastContext.Provider>
  );
};

export const useUiFeedback = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useUiFeedback must be used inside ToastProvider');
  return context;
};
