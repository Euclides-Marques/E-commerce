import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AddressDto, CreateAddressRequest } from '../models/address.model';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/addresses`;

  private readonly _addresses = signal<AddressDto[]>([]);
  readonly addresses = this._addresses.asReadonly();

  getAddresses(): Observable<AddressDto[]> {
    return this.http.get<AddressDto[]>(this.baseUrl).pipe(
      tap(addresses => this._addresses.set(addresses))
    );
  }

  createAddress(body: CreateAddressRequest): Observable<AddressDto> {
    return this.http.post<AddressDto>(this.baseUrl, body).pipe(
      tap(addr => this._addresses.update(list => [...list, addr]))
    );
  }

  updateAddress(id: string, body: CreateAddressRequest): Observable<AddressDto> {
    return this.http.put<AddressDto>(`${this.baseUrl}/${id}`, body).pipe(
      tap(updated => this._addresses.update(list => list.map(a => a.id === id ? updated : a)))
    );
  }

  deleteAddress(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this._addresses.update(list => list.filter(a => a.id !== id)))
    );
  }

  setDefault(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/set-default`, {}).pipe(
      tap(() => this._addresses.update(list =>
        list.map(a => ({ ...a, isDefault: a.id === id }))
      ))
    );
  }

  clearLocal(): void {
    this._addresses.set([]);
  }
}
