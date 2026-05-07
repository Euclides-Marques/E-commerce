using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ECommerce.Application.Features.Payments.Commands.HandleMercadoPagoWebhook;

public class HandleMercadoPagoWebhookCommandHandler : IRequestHandler<HandleMercadoPagoWebhookCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IMercadoPagoService _mpService;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;
    private readonly ILogger<HandleMercadoPagoWebhookCommandHandler> _logger;

    public HandleMercadoPagoWebhookCommandHandler(
        IApplicationDbContext context,
        IMercadoPagoService mpService,
        IEmailService emailService,
        INotificationService notificationService,
        ILogger<HandleMercadoPagoWebhookCommandHandler> logger)
    {
        _context = context;
        _mpService = mpService;
        _emailService = emailService;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<Result> Handle(HandleMercadoPagoWebhookCommand request, CancellationToken cancellationToken)
    {
        var (isValid, externalReference, status) = await _mpService.ProcessWebhookNotificationAsync(
            request.XSignature, request.XRequestId, request.DataId, cancellationToken);

        if (!isValid)
            return Result.Failure("Assinatura inválida.");

        if (string.IsNullOrEmpty(externalReference) || !Guid.TryParse(externalReference, out var orderId))
            return Result.Success();

        var payment = await _context.Payments
            .Include(p => p.Order)
                .ThenInclude(o => o.User)
            .FirstOrDefaultAsync(
                p => p.OrderId == orderId && p.Method == PaymentMethod.MercadoPago,
                cancellationToken);

        if (payment is null)
            return Result.Success();

        switch (status?.ToLower())
        {
            case "approved":
                payment.Status = PaymentStatus.Approved;
                payment.PaidAt = DateTime.UtcNow;
                payment.Order.Status = OrderStatus.Paid;

                await _context.SaveChangesAsync(cancellationToken);

                _ = Task.Run(async () =>
                {
                    try
                    {
                        await _emailService.SendPaymentConfirmedAsync(
                            payment.Order.User.Email,
                            payment.Order.User.FirstName,
                            payment.Order.OrderNumber,
                            payment.Order.Total,
                            CancellationToken.None);

                        await _notificationService.CreateAsync(
                            payment.Order.UserId,
                            "Pagamento confirmado!",
                            $"O pagamento do pedido {payment.Order.OrderNumber} via MercadoPago foi aprovado.",
                            NotificationType.PaymentConfirmed,
                            orderId: payment.OrderId,
                            relatedUrl: $"/orders/{payment.OrderId}",
                            cancellationToken: CancellationToken.None);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erro ao notificar pagamento confirmado via MercadoPago para pedido {OrderId}", payment.OrderId);
                    }
                });
                break;

            case "rejected":
            case "cancelled":
                payment.Status = PaymentStatus.Declined;
                await _context.SaveChangesAsync(cancellationToken);
                break;

            default:
                await _context.SaveChangesAsync(cancellationToken);
                break;
        }

        return Result.Success();
    }
}
