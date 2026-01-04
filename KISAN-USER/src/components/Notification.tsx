import { NotificationType } from '../hooks/useNotification';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: NotificationType;
  show: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export default function Notification({ 
  message, 
  type, 
  show, 
  onClose, 
  autoClose = true,
  duration = 5000 
}: NotificationProps) {
  if (!show) return null;

  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  const icon = icons[type];
  const bgColor = bgColors[type];

  return (
    <div className={`fixed top-5 right-5 ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl z-50 transition-all duration-300 transform ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} min-w-80 max-w-md`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Progress Bar for Auto Close */}
      {autoClose && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-30 rounded-b-xl overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-300 ease-out"
            style={{ 
              width: show ? '0%' : '100%',
              transition: `width ${duration}ms linear` 
            }}
          />
        </div>
      )}
    </div>
  );
}