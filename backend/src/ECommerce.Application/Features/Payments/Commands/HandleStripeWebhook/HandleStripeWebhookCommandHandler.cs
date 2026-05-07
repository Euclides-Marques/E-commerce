using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Payments.Commands.HandleStripeWebhook;

public class HandleStripeWebhookCommandHandler : IRequestHandler<HandleStripeWebhookCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IStripeService _stripeService;

    public HandleStripeWebhookCommandHandler(IApplicationDbContext context, IStripeService stripeService)
    {
        _context = context;
        _stripeService = stripeService;
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
            .FirstOrDefaultAsync(p => p.ExternalId == paymentIntentId, cancellationToken);

        if (payment is null)
            return Result.Success();

        switch (eventType)
        {
            case "payment_intent.succeeded":
                payment.Status = PaymentStatus.Approved;
                payment.PaidAt = DateTime.UtcNow;
                payment.Order.Status = OrderStatus.Paid;
                break;

            case "payment_intent.payment_failed":
                payment.Status = PaymentStatus.Declined;
                payment.FailureReason = failureMessage;
                break;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
