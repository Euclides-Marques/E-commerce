using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Addresses.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Addresses.Commands.UpdateAddress;

public record UpdateAddressCommand(
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
) : IRequest<Result<AddressDto>>;
