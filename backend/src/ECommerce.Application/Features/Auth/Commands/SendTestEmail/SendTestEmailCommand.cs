using ECommerce.Application.Common.Models;
using MediatR;

namespace ECommerce.Application.Features.Auth.Commands.SendTestEmail;

public record SendTestEmailCommand(string Email) : IRequest<Result<string>>;
