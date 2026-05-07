using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Notifications.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Notifications.Queries.GetNotifications;

public record GetNotificationsQuery(int Page = 1, int PageSize = 20) : IRequest<Result<PaginatedResult<NotificationDto>>>;
