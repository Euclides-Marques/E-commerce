using ECommerce.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace ECommerce.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public Task SendEmailConfirmationAsync(string email, string name, string token, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Email de confirmação enviado para {Email} com token {Token}", email, token);
        return Task.CompletedTask;
    }

    public Task SendPasswordResetAsync(string email, string name, string token, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Email de reset de senha enviado para {Email}", email);
        return Task.CompletedTask;
    }

    public Task SendOrderConfirmationAsync(string email, string name, string orderNumber, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Email de confirmação de pedido {OrderNumber} enviado para {Email}", orderNumber, email);
        return Task.CompletedTask;
    }
}