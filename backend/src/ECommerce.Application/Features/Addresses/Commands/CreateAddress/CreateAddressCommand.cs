using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Addresses.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Addresses.Commands.CreateAddress;

public record CreateAddressCommand(
    string Label,
    string Recipient,
    string ZipCode,
    string Street,
    string Number,
    string? Complement,
    string Neighborhood,
    string City,
    string State,
    string Country = "Brasil",
    bool IsDefault = false
) : IRequest<Result<AddressDto>>;
