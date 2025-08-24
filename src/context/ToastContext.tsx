import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, message, type, duration };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  if (toasts.length === 0) return null;

  return (
    <div 
      className="position-fixed top-0 end-0 p-3" 
      style={{ zIndex: 1055 }}
    >
      <div className="d-flex flex-column gap-2">
        {toasts.map(toast => (
          <ToastComponent key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </div>
    </div>
  );
};

interface ToastComponentProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastComponent = ({ toast, onClose }: ToastComponentProps) => {
  const getToastClasses = (type: ToastType) => {
    const baseClasses = "toast show animate__animated animate__slideInRight";
    switch (type) {
      case 'success':
        return `${baseClasses} border-success`;
      case 'error':
        return `${baseClasses} border-danger`;
      case 'warning':
        return `${baseClasses} border-warning`;
      case 'info':
      default:
        return `${baseClasses} border-info`;
    }
  };

  const getHeaderClasses = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-success text-white';
      case 'error':
        return 'bg-danger text-white';
      case 'warning':
        return 'bg-warning text-dark';
      case 'info':
      default:
        return 'bg-info text-white';
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={getToastClasses(toast.type)} role="alert" style={{minWidth: '300px'}}>
      <div className={`toast-header ${getHeaderClasses(toast.type)}`}>
        <span className="me-2">{getIcon(toast.type)}</span>
        <strong className="me-auto">
          {toast.type === 'success' && 'Correcto'}
          {toast.type === 'error' && 'Error'}
          {toast.type === 'warning' && 'Aviso'}
          {toast.type === 'info' && 'Información'}
        </strong>
        <button 
          type="button" 
          className="btn-close btn-close-white" 
          onClick={() => onClose(toast.id)}
          aria-label="Cerrar"
        ></button>
      </div>
      <div className="toast-body bg-white text-dark">
        {toast.message}
      </div>
    </div>
  );
};

export default ToastContext;
