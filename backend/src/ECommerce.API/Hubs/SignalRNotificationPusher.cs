using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Notifications.DTOs;
using Microsoft.AspNetCore.SignalR;

namespace ECommerce.API.Hubs;

public class SignalRNotificationPusher : INotificationPusher
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public SignalRNotificationPusher(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task PushAsync(string userId, NotificationDto notification, CancellationToken cancellationToken = default)
        => _hubContext.Clients
            .Group($"user:{userId}")
            .SendAsync("ReceiveNotification", notification, cancellationToken);
}
