import React, { useEffect } from 'react';
import { CheckCircle2, Heart, ShoppingBag, X } from 'lucide-react';

export default function ToastNotification({
  toast,
  onDismiss
}) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className={`floating-toast toast-${toast.type || 'info'}`}>
      <div className="toast-icon">
        {toast.type === 'cart' && <ShoppingBag size={18} className="toast-icon-cart" />}
        {toast.type === 'favorite' && <Heart size={18} fill="#f43f5e" color="#f43f5e" />}
        {toast.type === 'info' && <CheckCircle2 size={18} />}
      </div>
      <div className="toast-content">
        <span className="toast-title">{toast.title}</span>
        {toast.message && <p className="toast-message">{toast.message}</p>}
      </div>
      <button className="toast-close-btn" onClick={onDismiss} aria-label="Dismiss toast">
        <X size={15} />
      </button>
    </div>
  );
}
