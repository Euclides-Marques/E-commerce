using ECommerce.Application.Common.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace ECommerce.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly string _host;
    private readonly int _port;
    private readonly string _username;
    private readonly string _password;
    private readonly string _fromEmail;
    private readonly string _fromName;
    private readonly string _frontendUrl;
    private readonly bool _isConfigured;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _logger = logger;

        var smtp = configuration.GetSection("SmtpSettings");
        _host = smtp["Host"] ?? string.Empty;
        _port = int.TryParse(smtp["Port"], out var p) ? p : 587;
        _username = smtp["Username"] ?? string.Empty;
        _password = smtp["Password"] ?? string.Empty;
        _fromEmail = smtp["FromEmail"] ?? "noreply@shopbr.com";
        _fromName = smtp["FromName"] ?? "ShopBR";
        _frontendUrl = smtp["FrontendUrl"] ?? "https://novastore-smoky.vercel.app";

        _isConfigured = !string.IsNullOrWhiteSpace(_host)
            && !string.IsNullOrWhiteSpace(_username)
            && !string.IsNullOrWhiteSpace(_password);
    }

    private async Task SendAsync(
        string toEmail, string toName, string subject, string htmlBody,
        CancellationToken cancellationToken)
    {
        if (!_isConfigured)
        {
            _logger.LogInformation(
                "[Email] SMTP não configurado. Para {Email}: {Subject}", toEmail, subject);
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_fromName, _fromEmail));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            await client.ConnectAsync(_host, _port, SecureSocketOptions.StartTls, cancellationToken);
            await client.AuthenticateAsync(_username, _password, cancellationToken);
            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            _logger.LogInformation("[Email] Enviado para {Email}: {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Email] Falha ao enviar para {Email}: {Subject}", toEmail, subject);
        }
    }

    public Task SendWelcomeAsync(string email, string name, CancellationToken cancellationToken = default)
        => SendAsync(email, name, "Bem-vindo ao ShopBR!", EmailTemplates.Welcome(name), cancellationToken);

    public Task SendEmailConfirmationAsync(string email, string name, string token, CancellationToken cancellationToken = default)
    {
        var confirmUrl = $"{_frontendUrl}/auth/confirm-email?token={token}";
        return SendAsync(email, name, "Confirme seu e-mail — ShopBR",
            EmailTemplates.EmailConfirmation(name, confirmUrl), cancellationToken);
    }

    public Task SendPasswordResetAsync(string email, string name, string token, CancellationToken cancellationToken = default)
        => SendAsync(email, name, "Recuperação de senha — ShopBR",
            EmailTemplates.PasswordReset(name, token), cancellationToken);

    public Task SendOrderConfirmationAsync(string email, string name, string orderNumber, decimal total,
        CancellationToken cancellationToken = default)
        => SendAsync(email, name, $"Pedido {orderNumber} confirmado — ShopBR",
            EmailTemplates.OrderConfirmation(name, orderNumber, total), cancellationToken);

    public Task SendOrderStatusChangedAsync(string email, string name, string orderNumber,
        string newStatus, string statusLabel, CancellationToken cancellationToken = default)
        => SendAsync(email, name, $"Seu pedido {orderNumber} foi atualizado — ShopBR",
            EmailTemplates.OrderStatusChanged(name, orderNumber, statusLabel), cancellationToken);

    public Task SendPaymentConfirmedAsync(string email, string name, string orderNumber, decimal total,
        CancellationToken cancellationToken = default)
        => SendAsync(email, name, $"Pagamento aprovado — {orderNumber} — ShopBR",
            EmailTemplates.PaymentConfirmed(name, orderNumber, total), cancellationToken);

    public Task SendContactAsync(string senderName, string senderEmail, string subject, string message,
        CancellationToken cancellationToken = default)
        => SendAsync(_fromEmail, _fromName, $"[Contato] {subject} — de {senderName}",
            EmailTemplates.ContactMessage(senderName, senderEmail, subject, message), cancellationToken);
}
