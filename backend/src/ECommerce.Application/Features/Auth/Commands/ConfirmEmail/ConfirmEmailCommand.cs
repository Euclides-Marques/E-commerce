using ECommerce.Application.Common.Models;
using MediatR;

namespace ECommerce.Application.Features.Auth.Commands.ConfirmEmail;

public record ConfirmEmailCommand(string Token) : IRequest<Result>;
