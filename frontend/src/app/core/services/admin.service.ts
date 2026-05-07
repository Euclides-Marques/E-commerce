import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminOrderFilter,
  AdminOrderSummaryDto,
  AdminUserDto,
  AdminUserFilter,
  DashboardSummaryDto,
} from '../models/admin.model';
import { PaginatedResult } from '../models/paginated-result.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getDashboardSummary(daysBack = 30): Observable<DashboardSummaryDto> {
    return this.http.get<DashboardSummaryDto>(`${this.apiUrl}/dashboard/summary`, {
      params: new HttpParams().set('daysBack', daysBack),
    });
  }

  getOrders(filter: AdminOrderFilter): Observable<PaginatedResult<AdminOrderSummaryDto>> {
    let params = new HttpParams()
      .set('page', filter.page)
      .set('pageSize', filter.pageSize);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.dateFrom) params = params.set('dateFrom', filter.dateFrom);
    if (filter.dateTo) params = params.set('dateTo', filter.dateTo);
    if (filter.search) params = params.set('search', filter.search);
    return this.http.get<PaginatedResult<AdminOrderSummaryDto>>(`${this.apiUrl}/admin/orders`, { params });
  }

  updateOrderStatus(id: string, status: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/admin/orders/${id}/status`, { status });
  }

  getUsers(filter: AdminUserFilter): Observable<PaginatedResult<AdminUserDto>> {
    let params = new HttpParams()
      .set('page', filter.page)
      .set('pageSize', filter.pageSize);
    if (filter.search) params = params.set('search', filter.search);
    return this.http.get<PaginatedResult<AdminUserDto>>(`${this.apiUrl}/admin/users`, { params });
  }

  updateUserRole(id: string, role: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/admin/users/${id}/role`, { role });
  }

  toggleUserActive(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/admin/users/${id}/toggle-active`, {});
  }
}
