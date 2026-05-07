import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToggleWishlistResult, WishlistItemDto } from '../models/wishlist.model';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly http = inject(HttpClient);

  private readonly _items = signal<WishlistItemDto[]>([]);
  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().length);
  readonly productIds = computed(() => new Set(this._items().map(i => i.productId)));

  isInWishlist(productId: string): boolean {
    return this.productIds().has(productId);
  }

  load(): Observable<WishlistItemDto[]> {
    return this.http.get<WishlistItemDto[]>(`${environment.apiUrl}/wishlist`).pipe(
      tap(items => this._items.set(items))
    );
  }

  toggle(productId: string): Observable<ToggleWishlistResult> {
    return this.http.post<ToggleWishlistResult>(`${environment.apiUrl}/wishlist`, { productId }).pipe(
      tap(result => {
        if (result.isInWishlist) {
          return;
        }
        this._items.update(items => items.filter(i => i.productId !== productId));
      })
    );
  }

  refreshAfterAdd(productId: string, item: WishlistItemDto): void {
    if (!this.isInWishlist(productId)) {
      this._items.update(items => [item, ...items]);
    }
  }

  clear(): void {
    this._items.set([]);
  }
}
