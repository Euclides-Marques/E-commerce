namespace ECommerce.Application.Common.Interfaces;

public interface IEmailService
{
    Task SendWelcomeAsync(string email, string name, CancellationToken cancellationToken = default);
    Task SendEmailConfirmationAsync(string email, string name, string token, CancellationToken cancellationToken = default);
    Task SendPasswordResetAsync(string email, string name, string token, CancellationToken cancellationToken = default);
    Task SendOrderConfirmationAsync(string email, string name, string orderNumber, decimal total, CancellationToken cancellationToken = default);
    Task SendOrderStatusChangedAsync(string email, string name, string orderNumber, string newStatus, string statusLabel, CancellationToken cancellationToken = default);
    Task SendPaymentConfirmedAsync(string email, string name, string orderNumber, decimal total, CancellationToken cancellationToken = default);
    Task SendContactAsync(string senderName, string senderEmail, string subject, string message, CancellationToken cancellationToken = default);
}
