using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Auth.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace ECommerce.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<AuthResponseDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IEmailService _emailService;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<RegisterCommandHandler> _logger;

    public RegisterCommandHandler(
        IApplicationDbContext context,
        ITokenService tokenService,
        IPasswordHasher passwordHasher,
        IEmailService emailService,
        IServiceScopeFactory scopeFactory,
        ILogger<RegisterCommandHandler> logger)
    {
        _context = context;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
        _emailService = emailService;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task<Result<AuthResponseDto>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var emailExists = await _context.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Email == request.Email.ToLowerInvariant(), cancellationToken);

        if (emailExists)
            return Result<AuthResponseDto>.Failure("Este e-mail já está em uso.");

        var refreshToken = _tokenService.GenerateRefreshToken();

        var confirmationToken = Guid.NewGuid().ToString("N");

        var user = new User
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = request.Email.ToLowerInvariant(),
            PasswordHash = _passwordHasher.Hash(request.Password),
            Role = UserRole.Customer,
            RefreshToken = refreshToken,
            RefreshTokenExpiry = DateTime.UtcNow.AddDays(_tokenService.RefreshTokenExpirationDays),
            EmailConfirmationToken = confirmationToken,
            EmailConfirmationTokenExpiry = DateTime.UtcNow.AddHours(24),
            IsActive = true,
            PreferredLanguage = "pt-BR"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        var accessToken = _tokenService.GenerateAccessToken(user);

        var userDto = new UserDto(user.Id, user.FirstName, user.LastName, user.Email,
            user.Role.ToString(), user.AvatarUrl, user.PreferredLanguage, user.EmailConfirmed);

        var userId = user.Id;
        var firstName = user.FirstName;
        var email = user.Email;

        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendEmailConfirmationAsync(email, firstName, confirmationToken, CancellationToken.None);

                using var scope = _scopeFactory.CreateScope();
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
                await notificationService.CreateAsync(
                    userId,
                    "Bem-vindo ao ShopBR!",
                    $"Olá {firstName}, sua conta foi criada! Confirme seu e-mail para aproveitar todos os recursos.",
                    NotificationType.Welcome,
                    cancellationToken: CancellationToken.None);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao enviar confirmação de e-mail para {Email}", email);
            }
        });

        return Result<AuthResponseDto>.Success(new AuthResponseDto(accessToken, refreshToken, userDto));
    }
}
