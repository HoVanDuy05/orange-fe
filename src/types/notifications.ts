export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}
