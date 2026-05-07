using ECommerce.Domain.Enums;

namespace ECommerce.Application.Common.Interfaces;

public interface INotificationService
{
    Task CreateAsync(
        Guid userId,
        string title,
        string message,
        NotificationType type,
        Guid? orderId = null,
        string? relatedUrl = null,
        CancellationToken cancellationToken = default);
}
