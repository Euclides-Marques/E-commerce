using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ECommerce.Application.Features.Auth.Commands.SendTestEmail;

public class SendTestEmailCommandHandler : IRequestHandler<SendTestEmailCommand, Result<string>>
{
    private readonly IEmailService _emailService;
    private readonly ILogger<SendTestEmailCommandHandler> _logger;

    public SendTestEmailCommandHandler(IEmailService emailService, ILogger<SendTestEmailCommandHandler> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<Result<string>> Handle(SendTestEmailCommand request, CancellationToken cancellationToken)
    {
        try
        {
            await _emailService.SendWelcomeAsync(request.Email, "Teste SMTP", cancellationToken);
            return Result<string>.Success($"E-mail enviado com sucesso para {request.Email}!");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[TestEmail] Falha ao enviar para {Email}", request.Email);
            return Result<string>.Failure($"Falha ao enviar: {ex.Message}");
        }
    }
}
