import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoryDto } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/categories`;

  private readonly _categories = signal<CategoryDto[]>([]);

  readonly categories = this._categories.asReadonly();

  getCategories(isActive?: boolean): Observable<CategoryDto[]> {
    const params: Record<string, string> = {};
    if (isActive !== undefined) params['isActive'] = String(isActive);

    return this.http.get<CategoryDto[]>(this.baseUrl, { params }).pipe(
      tap(categories => this._categories.set(categories))
    );
  }
}
