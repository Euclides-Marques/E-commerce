using ECommerce.Application.Common.Models;
using MediatR;

namespace ECommerce.Application.Features.Notifications.Queries.GetUnreadCount;

public record GetUnreadCountQuery : IRequest<Result<int>>;
