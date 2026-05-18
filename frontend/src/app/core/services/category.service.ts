import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/categories`;

  private readonly _categories = signal<CategoryDto[]>([]);
  private readonly _hierarchy = signal<CategoryDto[]>([]);

  readonly categories = this._categories.asReadonly();
  readonly hierarchy = this._hierarchy.asReadonly();

  getCategories(isActive?: boolean): Observable<CategoryDto[]> {
    const params: Record<string, string> = {};
    if (isActive !== undefined) params['isActive'] = String(isActive);

    return this.http.get<CategoryDto[]>(this.baseUrl, { params }).pipe(
      tap(categories => this._categories.set(categories))
    );
  }

  getCategoriesHierarchy(isActive?: boolean): Observable<CategoryDto[]> {
    const params: Record<string, string> = {};
    if (isActive !== undefined) params['isActive'] = String(isActive);

    return this.http.get<CategoryDto[]>(`${this.baseUrl}/hierarchy`, { params }).pipe(
      tap(hierarchy => this._hierarchy.set(hierarchy))
    );
  }

  createCategory(dto: CreateCategoryDto): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(this.baseUrl, dto);
  }

  updateCategory(id: string, dto: UpdateCategoryDto): Observable<CategoryDto> {
    return this.http.put<CategoryDto>(`${this.baseUrl}/${id}`, dto);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadCategoryImage(id: string, file: File): Observable<CategoryDto> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CategoryDto>(`${this.baseUrl}/${id}/image`, formData);
  }
}
