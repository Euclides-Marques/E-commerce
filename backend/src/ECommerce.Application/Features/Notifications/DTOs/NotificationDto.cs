namespace ECommerce.Application.Features.Notifications.DTOs;

public record NotificationDto(
    Guid Id,
    string Title,
    string Message,
    string Type,
    bool IsRead,
    DateTime? ReadAt,
    Guid? OrderId,
    string? RelatedUrl,
    DateTime CreatedAt
);
