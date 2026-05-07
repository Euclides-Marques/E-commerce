namespace ECommerce.Application.Common.Interfaces;

public interface IStripeService
{
    Task<(string PaymentIntentId, string ClientSecret)> CreatePaymentIntentAsync(
        decimal amount, string currency, Guid orderId, CancellationToken cancellationToken = default);

    (bool IsValid, string? EventType, string? PaymentIntentId, string? FailureMessage) ParseWebhookEvent(
        string payload, string stripeSignature);
}
