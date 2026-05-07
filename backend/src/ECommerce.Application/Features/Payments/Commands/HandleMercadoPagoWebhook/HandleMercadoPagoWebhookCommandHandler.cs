using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Payments.Commands.HandleMercadoPagoWebhook;

public class HandleMercadoPagoWebhookCommandHandler : IRequestHandler<HandleMercadoPagoWebhookCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IMercadoPagoService _mpService;

    public HandleMercadoPagoWebhookCommandHandler(IApplicationDbContext context, IMercadoPagoService mpService)
    {
        _context = context;
        _mpService = mpService;
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
                break;

            case "rejected":
            case "cancelled":
                payment.Status = PaymentStatus.Declined;
                break;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
