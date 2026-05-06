import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartDto } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/cart`;

  private readonly _cart = signal<CartDto | null>(null);
  readonly cart = this._cart.asReadonly();
  readonly totalItems = computed(() => this._cart()?.totalItems ?? 0);
  readonly totalPrice = computed(() => this._cart()?.totalPrice ?? 0);
  readonly isEmpty = computed(() => (this._cart()?.items.length ?? 0) === 0);

  getCart(): Observable<CartDto> {
    return this.http.get<CartDto>(this.baseUrl).pipe(
      tap(cart => this._cart.set(cart))
    );
  }

  addToCart(productId: string, quantity = 1): Observable<CartDto> {
    return this.http.post<CartDto>(`${this.baseUrl}/items`, { productId, quantity }).pipe(
      tap(cart => this._cart.set(cart))
    );
  }

  updateItem(productId: string, quantity: number): Observable<CartDto> {
    return this.http.put<CartDto>(`${this.baseUrl}/items/${productId}`, { quantity }).pipe(
      tap(cart => this._cart.set(cart))
    );
  }

  removeItem(productId: string): Observable<CartDto> {
    return this.http.delete<CartDto>(`${this.baseUrl}/items/${productId}`).pipe(
      tap(cart => this._cart.set(cart))
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.baseUrl).pipe(
      tap(() => this._cart.set({ items: [], totalItems: 0, totalPrice: 0 }))
    );
  }

  clearLocal(): void {
    this._cart.set(null);
  }
}
