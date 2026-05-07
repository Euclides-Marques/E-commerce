using ECommerce.Application.Common.Models;
using MediatR;

namespace ECommerce.Application.Features.Admin.Users.Commands.ToggleUserActive;

public record ToggleUserActiveCommand(Guid UserId) : IRequest<Result>;
