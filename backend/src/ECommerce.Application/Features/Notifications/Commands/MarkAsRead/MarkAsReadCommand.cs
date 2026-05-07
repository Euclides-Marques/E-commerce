using ECommerce.Application.Common.Models;
using MediatR;

namespace ECommerce.Application.Features.Notifications.Commands.MarkAsRead;

public record MarkAsReadCommand(Guid NotificationId) : IRequest<Result>;
