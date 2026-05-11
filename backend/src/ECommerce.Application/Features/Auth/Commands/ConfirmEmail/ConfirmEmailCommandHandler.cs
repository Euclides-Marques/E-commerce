using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ECommerce.Application.Features.Auth.Commands.ConfirmEmail;

public class ConfirmEmailCommandHandler : IRequestHandler<ConfirmEmailCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<ConfirmEmailCommandHandler> _logger;

    public ConfirmEmailCommandHandler(IApplicationDbContext context, ILogger<ConfirmEmailCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result> Handle(ConfirmEmailCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.EmailConfirmationToken == request.Token, cancellationToken);

        if (user is null)
            return Result.Failure("Token de confirmação inválido.");

        if (user.EmailConfirmed)
            return Result.Failure("E-mail já confirmado.");

        if (user.EmailConfirmationTokenExpiry is null || user.EmailConfirmationTokenExpiry < DateTime.UtcNow)
            return Result.Failure("Token de confirmação expirado. Realize um novo cadastro ou solicite reenvio.");

        user.EmailConfirmed = true;
        user.EmailConfirmationToken = null;
        user.EmailConfirmationTokenExpiry = null;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("E-mail confirmado para usuário {UserId}", user.Id);

        return Result.Success();
    }
}
