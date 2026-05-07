using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ECommerce.Application.Features.Payments.Commands.HandleStripeWebhook;

public class HandleStripeWebhookCommandHandler : IRequestHandler<HandleStripeWebhookCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IStripeService _stripeService;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;
    private readonly ILogger<HandleStripeWebhookCommandHandler> _logger;

    public HandleStripeWebhookCommandHandler(
        IApplicationDbContext context,
        IStripeService stripeService,
        IEmailService emailService,
        INotificationService notificationService,
        ILogger<HandleStripeWebhookCommandHandler> logger)
    {
        _context = context;
        _stripeService = stripeService;
        _emailService = emailService;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<Result> Handle(HandleStripeWebhookCommand request, CancellationToken cancellationToken)
    {
        var (isValid, eventType, paymentIntentId, failureMessage) =
            _stripeService.ParseWebhookEvent(request.Payload, request.Signature);

        if (!isValid)
            return Result.Failure("Assinatura inválida.");

        if (string.IsNullOrEmpty(eventType) || string.IsNullOrEmpty(paymentIntentId))
            return Result.Success();

        var payment = await _context.Payments
            .Include(p => p.Order)
                .ThenInclude(o => o.User)
            .FirstOrDefaultAsync(p => p.ExternalId == paymentIntentId, cancellationToken);

        if (payment is null)
            return Result.Success();

        switch (eventType)
        {
            case "payment_intent.succeeded":
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
                            $"O pagamento do pedido {payment.Order.OrderNumber} foi aprovado. Seu pedido está sendo preparado.",
                            NotificationType.PaymentConfirmed,
                            orderId: payment.OrderId,
                            relatedUrl: $"/orders/{payment.OrderId}",
                            cancellationToken: CancellationToken.None);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erro ao notificar pagamento confirmado via Stripe para pedido {OrderId}", payment.OrderId);
                    }
                });
                break;

            case "payment_intent.payment_failed":
                payment.Status = PaymentStatus.Declined;
                payment.FailureReason = failureMessage;
                await _context.SaveChangesAsync(cancellationToken);
                break;

            default:
                await _context.SaveChangesAsync(cancellationToken);
                break;
        }

        return Result.Success();
    }
}
