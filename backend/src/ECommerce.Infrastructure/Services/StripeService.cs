using ECommerce.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stripe;

namespace ECommerce.Infrastructure.Services;

public class StripeService : IStripeService
{
    private readonly string _webhookSecret;
    private readonly ILogger<StripeService> _logger;

    public StripeService(IConfiguration configuration, ILogger<StripeService> logger)
    {
        _logger = logger;
        StripeConfiguration.ApiKey = configuration["Stripe:SecretKey"] ?? string.Empty;
        _webhookSecret = configuration["Stripe:WebhookSecret"] ?? string.Empty;
    }

    public async Task<(string PaymentIntentId, string ClientSecret)> CreatePaymentIntentAsync(
        decimal amount, string currency, Guid orderId, CancellationToken cancellationToken = default)
    {
        var options = new PaymentIntentCreateOptions
        {
            Amount = (long)(amount * 100),
            Currency = currency,
            Metadata = new Dictionary<string, string> { ["orderId"] = orderId.ToString() },
        };

        var service = new PaymentIntentService();
        var intent = await service.CreateAsync(options, cancellationToken: cancellationToken);

        return (intent.Id, intent.ClientSecret);
    }

    public (bool IsValid, string? EventType, string? PaymentIntentId, string? FailureMessage) ParseWebhookEvent(
        string payload, string stripeSignature)
    {
        try
        {
            var stripeEvent = EventUtility.ConstructEvent(payload, stripeSignature, _webhookSecret);

            string? paymentIntentId = null;
            string? failureMessage = null;

            if (stripeEvent.Data.Object is PaymentIntent intent)
            {
                paymentIntentId = intent.Id;
                failureMessage = intent.LastPaymentError?.Message;
            }

            return (true, stripeEvent.Type, paymentIntentId, failureMessage);
        }
        catch (StripeException ex)
        {
            _logger.LogWarning("Stripe webhook assinatura inválida: {Message}", ex.Message);
            return (false, null, null, null);
        }
    }
}
