import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const icons = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
};

const colors = {
  success: 'border-l-green-500 bg-green-50 dark:bg-green-900/30',
  error: 'border-l-red-500 bg-red-50 dark:bg-red-900/30',
  info: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/30',
  warning: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/30',
};

const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-[90vw] sm:max-w-sm">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`toast-enter flex items-start gap-3 p-4 rounded-xl shadow-xl border-l-4
          ${colors[toast.type]} backdrop-blur-sm`}
      >
        <span className="text-lg shrink-0">{icons[toast.type]}</span>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">{toast.message}</p>
        <button
          onClick={() => removeToast(toast.id)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0 text-lg leading-none"
        >×</button>
      </div>
    ))}
  </div>
);
