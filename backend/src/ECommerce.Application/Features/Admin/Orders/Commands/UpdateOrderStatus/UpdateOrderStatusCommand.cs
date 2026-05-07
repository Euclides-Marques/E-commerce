using ECommerce.Application.Common.Models;
using MediatR;

namespace ECommerce.Application.Features.Admin.Orders.Commands.UpdateOrderStatus;

public record UpdateOrderStatusCommand(Guid OrderId, string Status) : IRequest<Result>;
