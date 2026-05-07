namespace ECommerce.Application.Features.Payments.DTOs;

public record PaymentDto(
    Guid Id,
    Guid OrderId,
    string Method,
    string Status,
    decimal Amount,
    string? ExternalId,
    DateTime? PaidAt);

public record StripePaymentIntentDto(Guid PaymentId, string ClientSecret);

public record MercadoPagoPreferenceDto(Guid PaymentId, string InitPoint);
