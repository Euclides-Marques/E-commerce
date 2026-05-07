using System.Text.Json;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Notifications.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace ECommerce.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private const string RedisChannelName = "ecommerce:notifications";

    private readonly IApplicationDbContext _context;
    private readonly INotificationPusher _pusher;
    private readonly ILogger<NotificationService> _logger;
    private readonly IConnectionMultiplexer? _redis;

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public NotificationService(
        IApplicationDbContext context,
        INotificationPusher pusher,
        ILogger<NotificationService> logger,
        IConnectionMultiplexer? redis = null)
    {
        _context = context;
        _pusher = pusher;
        _logger = logger;
        _redis = redis;
    }

    public async Task CreateAsync(
        Guid userId,
        string title,
        string message,
        NotificationType type,
        Guid? orderId = null,
        string? relatedUrl = null,
        CancellationToken cancellationToken = default)
    {
        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            OrderId = orderId,
            RelatedUrl = relatedUrl,
        };

        await _context.Notifications.AddAsync(notification, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new NotificationDto(
            notification.Id,
            notification.Title,
            notification.Message,
            notification.Type.ToString(),
            notification.IsRead,
            notification.ReadAt,
            notification.OrderId,
            notification.RelatedUrl,
            notification.CreatedAt);

        // Push in-process (mesma instância)
        try
        {
            await _pusher.PushAsync(userId.ToString(), dto, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao fazer push SignalR para userId {UserId}", userId);
        }

        // Publicar no Redis para broadcasting cross-instância
        if (_redis is not null)
        {
            try
            {
                var payload = JsonSerializer.Serialize(
                    new { UserId = userId.ToString(), Notification = dto }, JsonOpts);

                await _redis.GetSubscriber().PublishAsync(RedisChannelName, payload);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Falha ao publicar notificação no Redis para userId {UserId}", userId);
            }
        }
    }
}
