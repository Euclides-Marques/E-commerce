using System.Text.Json;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Notifications.DTOs;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace ECommerce.Infrastructure.BackgroundServices;

public class NotificationBackgroundService : BackgroundService
{
    private const string RedisChannelName = "ecommerce:notifications";

    private readonly IConnectionMultiplexer _redis;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<NotificationBackgroundService> _logger;

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public NotificationBackgroundService(
        IConnectionMultiplexer redis,
        IServiceProvider serviceProvider,
        ILogger<NotificationBackgroundService> logger)
    {
        _redis = redis;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("[NotificationBackgroundService] Inscrevendo no canal Redis '{Channel}'", RedisChannelName);

        var subscriber = _redis.GetSubscriber();

        await subscriber.SubscribeAsync(
            RedisChannelName,
            async (_, value) =>
            {
                if (value.IsNull) return;

                try
                {
                    var payload = JsonSerializer.Deserialize<NotificationPayload>((string)value!, JsonOpts);
                    if (payload?.UserId is null || payload.Notification is null) return;

                    // INotificationPusher é singleton — pode ser acessado diretamente
                    var pusher = _serviceProvider.GetRequiredService<INotificationPusher>();
                    await pusher.PushAsync(payload.UserId, payload.Notification, stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[NotificationBackgroundService] Erro ao processar mensagem do Redis");
                }
            });

        // Manter o serviço ativo até o cancelamento
        await Task.Delay(Timeout.Infinite, stoppingToken).ConfigureAwait(false);
    }

    private sealed record NotificationPayload(string? UserId, NotificationDto? Notification);
}
