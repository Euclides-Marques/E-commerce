namespace ECommerce.Application.Common.Interfaces;

public interface IMercadoPagoService
{
    Task<(string PreferenceId, string InitPoint)> CreatePreferenceAsync(
        decimal amount, Guid orderId, string description, CancellationToken cancellationToken = default);

    Task<(bool IsValid, string? OrderId, string? Status)> ProcessWebhookNotificationAsync(
        string xSignature, string xRequestId, string? dataId, CancellationToken cancellationToken = default);
}
