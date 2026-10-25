import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'warning' | 'error' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (type: NotificationType, title: string, message: string) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showNotification = useCallback((type: NotificationType, title: string, message: string) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newNotif: Notification = { id, type, title, message, timestamp: new Date() };

    setNotifications(prev => [newNotif, ...prev.slice(0, 4)]);

    setTimeout(() => {
      removeNotification(id);
    }, 6000);
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`pointer-events-auto rounded-lg shadow-lg border p-4 flex items-start gap-3 transition-all transform duration-200 animate-slide-in ${
              n.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : n.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : n.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {n.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {n.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
              {n.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
            </div>
            <div className="flex-1 text-sm">
              <h4 className="font-semibold">{n.title}</h4>
              <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{n.message}</p>
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};
