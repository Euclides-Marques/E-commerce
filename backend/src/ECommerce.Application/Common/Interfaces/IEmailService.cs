namespace ECommerce.Application.Common.Interfaces;

public interface IEmailService
{
    Task SendEmailConfirmationAsync(string email, string name, string token, CancellationToken cancellationToken = default);
    Task SendPasswordResetAsync(string email, string name, string token, CancellationToken cancellationToken = default);
    Task SendOrderConfirmationAsync(string email, string name, string orderNumber, CancellationToken cancellationToken = default);
}