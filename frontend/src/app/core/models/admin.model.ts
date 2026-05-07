export interface DashboardSummaryDto {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  paidOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  recentRevenue: number;
  topProducts: TopProductDto[];
  recentOrders: AdminOrderSummaryDto[];
  dailySales: DailySalesDto[];
}

export interface TopProductDto {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
  imageUrl?: string;
}

export interface DailySalesDto {
  date: string;
  totalOrders: number;
  totalRevenue: number;
}

export interface AdminOrderSummaryDto {
  id: string;
  orderNumber: string;
  userName: string;
  userEmail: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

export interface AdminUserDto {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  emailConfirmed: boolean;
  createdAt: string;
  ordersCount: number;
}

export interface AdminOrderFilter {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page: number;
  pageSize: number;
}

export interface AdminUserFilter {
  search?: string;
  page: number;
  pageSize: number;
}
