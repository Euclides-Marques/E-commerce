using ECommerce.Application.Features.Notifications.DTOs;

namespace ECommerce.Application.Common.Interfaces;

public interface INotificationPusher
{
    Task PushAsync(string userId, NotificationDto notification, CancellationToken cancellationToken = default);
}
