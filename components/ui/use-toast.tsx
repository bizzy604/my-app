// Minimal toast implementation based on shadcn/ui toast
import { useState, createContext, useContext } from 'react';

type ToastType = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

type ToastContextType = {
  toast: (props: ToastType) => void;
  toasts: ToastType[];
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const toast = (props: ToastType) => {
    setToasts((current) => [...current, props]);
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts((current) => current.slice(1));
    }, 5000);
  };

  return (
    <ToastContext.Provider value={{ toast, toasts }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t, i) => (
          <div
            key={i}
            className={`p-4 rounded-md shadow-md ${
              t.variant === 'destructive' ? 'bg-red-100 border border-red-300' : 'bg-white border border-gray-200'
            }`}
          >
            {t.title && <h4 className="font-semibold">{t.title}</h4>}
            {t.description && <p className="text-sm text-gray-600">{t.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
