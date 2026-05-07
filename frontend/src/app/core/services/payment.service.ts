import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MercadoPagoPreferenceResponse, StripePaymentIntentResponse } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);

  createStripePaymentIntent(orderId: string): Observable<StripePaymentIntentResponse> {
    return this.http.post<StripePaymentIntentResponse>(
      `${environment.apiUrl}/payments/stripe/create-intent`,
      { orderId }
    );
  }

  createMercadoPagoPreference(orderId: string): Observable<MercadoPagoPreferenceResponse> {
    return this.http.post<MercadoPagoPreferenceResponse>(
      `${environment.apiUrl}/payments/mercadopago/create-preference`,
      { orderId }
    );
  }
}
