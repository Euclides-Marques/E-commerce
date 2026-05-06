namespace ECommerce.Application.Features.Auth.DTOs;

public record UserDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string Role,
    string? AvatarUrl,
    string PreferredLanguage
);
