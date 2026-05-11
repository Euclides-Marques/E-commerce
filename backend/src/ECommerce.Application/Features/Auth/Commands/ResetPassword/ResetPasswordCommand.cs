using ECommerce.Application.Common.Models;
using MediatR;

namespace ECommerce.Application.Features.Auth.Commands.ResetPassword;

public record ResetPasswordCommand(string Token, string NewPassword) : IRequest<Result>;
