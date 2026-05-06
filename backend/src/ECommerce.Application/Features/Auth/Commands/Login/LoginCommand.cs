using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Auth.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Auth.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<Result<AuthResponseDto>>;
