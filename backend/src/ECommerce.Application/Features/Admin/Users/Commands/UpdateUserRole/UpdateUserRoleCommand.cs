using ECommerce.Application.Common.Models;
using MediatR;

namespace ECommerce.Application.Features.Admin.Users.Commands.UpdateUserRole;

public record UpdateUserRoleCommand(Guid UserId, string Role) : IRequest<Result>;
