using ECommerce.Application.Common.Models;
using MediatR;

namespace ECommerce.Application.Features.Addresses.Commands.DeleteAddress;

public record DeleteAddressCommand(Guid Id) : IRequest<Result>;
