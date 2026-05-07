using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ECommerce.Application.Features.Admin.Orders.Commands.UpdateOrderStatus;

public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;
    private readonly ILogger<UpdateOrderStatusCommandHandler> _logger;

    private static readonly Dictionary<OrderStatus, string> StatusLabels = new()
    {
        [OrderStatus.Pending] = "Pendente",
        [OrderStatus.Paid] = "Pago",
        [OrderStatus.Shipped] = "Enviado",
        [OrderStatus.Delivered] = "Entregue",
        [OrderStatus.Cancelled] = "Cancelado",
        [OrderStatus.Refunded] = "Reembolsado"
    };

    public UpdateOrderStatusCommandHandler(
        IApplicationDbContext context,
        IEmailService emailService,
        INotificationService notificationService,
        ILogger<UpdateOrderStatusCommandHandler> logger)
    {
        _context = context;
        _emailService = emailService;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<Result> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId && !o.IsDeleted, cancellationToken);

        if (order is null)
            return Result.Failure("Pedido não encontrado.");

        if (!Enum.TryParse<OrderStatus>(request.Status, true, out var newStatus))
            return Result.Failure("Status inválido.");

        order.Status = newStatus;

        if (newStatus == OrderStatus.Delivered)
            order.DeliveredAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        var statusLabel = StatusLabels.GetValueOrDefault(newStatus, request.Status);

        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendOrderStatusChangedAsync(
                    order.User.Email, order.User.FirstName,
                    order.OrderNumber, newStatus.ToString(), statusLabel,
                    CancellationToken.None);

                await _notificationService.CreateAsync(
                    order.UserId,
                    "Status do pedido atualizado",
                    $"Seu pedido {order.OrderNumber} está agora com status: {statusLabel}",
                    NotificationType.OrderStatusChanged,
                    orderId: order.Id,
                    relatedUrl: $"/orders/{order.Id}",
                    cancellationToken: CancellationToken.None);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao notificar atualização de status do pedido {OrderNumber}", order.OrderNumber);
            }
        });

        return Result.Success();
    }
}
