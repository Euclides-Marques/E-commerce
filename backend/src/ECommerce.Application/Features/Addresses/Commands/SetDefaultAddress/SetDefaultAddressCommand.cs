using ECommerce.Application.Common.Models;
using MediatR;

namespace ECommerce.Application.Features.Addresses.Commands.SetDefaultAddress;

public record SetDefaultAddressCommand(Guid Id) : IRequest<Result>;
