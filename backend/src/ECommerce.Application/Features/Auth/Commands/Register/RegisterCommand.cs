using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Auth.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Auth.Commands.Register;

public record RegisterCommand(
    string FirstName,
    string LastName,
    string Email,
    string Password
) : IRequest<Result<AuthResponseDto>>;
