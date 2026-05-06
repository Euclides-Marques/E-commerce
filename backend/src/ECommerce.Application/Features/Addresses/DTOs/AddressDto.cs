namespace ECommerce.Application.Features.Addresses.DTOs;

public record AddressDto(
    Guid Id,
    string Label,
    string Recipient,
    string ZipCode,
    string Street,
    string Number,
    string? Complement,
    string Neighborhood,
    string City,
    string State,
    string Country,
    bool IsDefault
);
