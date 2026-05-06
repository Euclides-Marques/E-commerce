import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderDto, OrderSummaryDto } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/orders`;

  private readonly _orders = signal<OrderSummaryDto[]>([]);
  readonly orders = this._orders.asReadonly();

  getOrders(): Observable<OrderSummaryDto[]> {
    return this.http.get<OrderSummaryDto[]>(this.baseUrl).pipe(
      tap(orders => this._orders.set(orders))
    );
  }

  getOrderById(id: string): Observable<OrderDto> {
    return this.http.get<OrderDto>(`${this.baseUrl}/${id}`);
  }

  placeOrder(shippingAddressId: string, notes?: string): Observable<OrderDto> {
    return this.http.post<OrderDto>(this.baseUrl, { shippingAddressId, notes });
  }

  cancelOrder(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/cancel`, {}).pipe(
      tap(() => this._orders.update(list =>
        list.map(o => o.id === id ? { ...o, status: 'Cancelled' } : o)
      ))
    );
  }
}
