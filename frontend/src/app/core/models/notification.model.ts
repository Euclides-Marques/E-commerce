export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: 'Welcome' | 'OrderPlaced' | 'OrderStatusChanged' | 'PaymentConfirmed' | string;
  isRead: boolean;
  readAt: string | null;
  orderId: string | null;
  relatedUrl: string | null;
  createdAt: string;
}

export interface NotificationsPage {
  items: NotificationDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
