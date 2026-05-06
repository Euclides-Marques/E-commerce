using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Auth.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Auth.Commands.RefreshToken;

public record RefreshTokenCommand(string RefreshToken) : IRequest<Result<AuthResponseDto>>;
