import React from 'react';
import { 
  Bell, CheckCircle2, AlertCircle, Info, AlertTriangle 
} from 'lucide-react';
import { NotificationType } from '@/types/notifications';

export const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'info': return <Info size={18} />;
    case 'success': return <CheckCircle2 size={18} />;
    case 'warning': return <AlertTriangle size={18} />;
    case 'error': return <AlertCircle size={18} />;
    default: return <Bell size={18} />;
  }
};

export const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'info': return 'blue';
    case 'success': return 'green';
    case 'warning': return 'orange';
    case 'error': return 'red';
    default: return 'brand';
  }
};
