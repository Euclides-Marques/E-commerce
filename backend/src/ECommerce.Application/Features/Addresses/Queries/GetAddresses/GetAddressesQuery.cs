using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Addresses.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Addresses.Queries.GetAddresses;

public record GetAddressesQuery : IRequest<Result<List<AddressDto>>>;
