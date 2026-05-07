using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Payments.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Payments.Commands.CreateStripePaymentIntent;

public class CreateStripePaymentIntentCommandHandler
    : IRequestHandler<CreateStripePaymentIntentCommand, Result<StripePaymentIntentDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IStripeService _stripeService;

    public CreateStripePaymentIntentCommandHandler(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        IStripeService stripeService)
    {
        _context = context;
        _currentUser = currentUser;
        _stripeService = stripeService;
    }

    public async Task<Result<StripePaymentIntentDto>> Handle(
        CreateStripePaymentIntentCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Result<StripePaymentIntentDto>.Failure("Usuário não autenticado.");

        var order = await _context.Orders.FirstOrDefaultAsync(
            o => o.Id == request.OrderId && o.UserId == _currentUser.UserId.Value && !o.IsDeleted,
            cancellationToken);

        if (order is null)
            return Result<StripePaymentIntentDto>.Failure("Pedido não encontrado.");

        var (paymentIntentId, clientSecret) = await _stripeService.CreatePaymentIntentAsync(
            order.Total, "brl", order.Id, cancellationToken);

        var payment = new Payment
        {
            OrderId = order.Id,
            Method = PaymentMethod.Stripe,
            Status = PaymentStatus.Pending,
            Amount = order.Total,
            ExternalId = paymentIntentId,
        };

        await _context.Payments.AddAsync(payment, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<StripePaymentIntentDto>.Success(new StripePaymentIntentDto(payment.Id, clientSecret));
    }
}
