using ECommerce.Application.Common.Models;
using MediatR;

namespace ECommerce.Application.Features.Notifications.Commands.MarkAllAsRead;

public record MarkAllAsReadCommand : IRequest<Result>;
