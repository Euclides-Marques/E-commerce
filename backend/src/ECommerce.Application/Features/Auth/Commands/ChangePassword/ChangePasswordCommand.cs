using ECommerce.Application.Common.Models;
using MediatR;

namespace ECommerce.Application.Features.Auth.Commands.ChangePassword;

public record ChangePasswordCommand(string CurrentPassword, string NewPassword) : IRequest<Result<Unit>>;
