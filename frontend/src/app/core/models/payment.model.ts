export interface StripePaymentIntentResponse {
  paymentId: string;
  clientSecret: string;
}

export interface MercadoPagoPreferenceResponse {
  paymentId: string;
  initPoint: string;
}

export type PaymentMethod = 'stripe' | 'mercadopago';
