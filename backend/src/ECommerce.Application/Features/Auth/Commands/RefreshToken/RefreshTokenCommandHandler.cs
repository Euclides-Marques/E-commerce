using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Auth.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Auth.Commands.RefreshToken;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthResponseDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;

    public RefreshTokenCommandHandler(IApplicationDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<Result<AuthResponseDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken, cancellationToken);

        if (user is null || user.RefreshTokenExpiry <= DateTime.UtcNow)
            return Result<AuthResponseDto>.Failure("Refresh token inválido ou expirado.");

        if (!user.IsActive)
            return Result<AuthResponseDto>.Failure("Conta desativada.");

        var newAccessToken = _tokenService.GenerateAccessToken(user);
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(_tokenService.RefreshTokenExpirationDays);
        await _context.SaveChangesAsync(cancellationToken);

        var userDto = new UserDto(user.Id, user.FirstName, user.LastName, user.Email,
            user.Role.ToString(), user.AvatarUrl, user.PreferredLanguage, user.EmailConfirmed);

        return Result<AuthResponseDto>.Success(new AuthResponseDto(newAccessToken, newRefreshToken, userDto));
    }
}
