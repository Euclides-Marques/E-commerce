using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Auth.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ECommerce.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<AuthResponseDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;
    private readonly ILogger<RegisterCommandHandler> _logger;

    public RegisterCommandHandler(
        IApplicationDbContext context,
        ITokenService tokenService,
        IPasswordHasher passwordHasher,
        IEmailService emailService,
        INotificationService notificationService,
        ILogger<RegisterCommandHandler> logger)
    {
        _context = context;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
        _emailService = emailService;
        _notificationService = notificationService;
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

        // Disparar email de confirmação e notificação in-app (fire-and-forget seguro)
        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendEmailConfirmationAsync(user.Email, user.FirstName, confirmationToken, CancellationToken.None);
                await _notificationService.CreateAsync(
                    user.Id,
                    "Bem-vindo ao ShopBR!",
                    $"Olá {user.FirstName}, sua conta foi criada! Confirme seu e-mail para aproveitar todos os recursos.",
                    NotificationType.Welcome,
                    cancellationToken: CancellationToken.None);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao enviar confirmação de e-mail para {Email}", user.Email);
            }
        });

        return Result<AuthResponseDto>.Success(new AuthResponseDto(accessToken, refreshToken, userDto));
    }
}
