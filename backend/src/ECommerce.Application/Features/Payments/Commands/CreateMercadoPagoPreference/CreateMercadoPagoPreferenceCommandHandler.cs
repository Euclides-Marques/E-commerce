using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Payments.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Payments.Commands.CreateMercadoPagoPreference;

public class CreateMercadoPagoPreferenceCommandHandler
    : IRequestHandler<CreateMercadoPagoPreferenceCommand, Result<MercadoPagoPreferenceDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IMercadoPagoService _mpService;

    public CreateMercadoPagoPreferenceCommandHandler(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        IMercadoPagoService mpService)
    {
        _context = context;
        _currentUser = currentUser;
        _mpService = mpService;
    }

    public async Task<Result<MercadoPagoPreferenceDto>> Handle(
        CreateMercadoPagoPreferenceCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Result<MercadoPagoPreferenceDto>.Failure("Usuário não autenticado.");

        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(
                o => o.Id == request.OrderId && o.UserId == _currentUser.UserId.Value && !o.IsDeleted,
                cancellationToken);

        if (order is null)
            return Result<MercadoPagoPreferenceDto>.Failure("Pedido não encontrado.");

        var description = $"Pedido {order.OrderNumber} — {order.Items.Count} item(s)";
        var (preferenceId, initPoint) = await _mpService.CreatePreferenceAsync(
            order.Total, order.Id, description, cancellationToken);

        var payment = new Payment
        {
            OrderId = order.Id,
            Method = PaymentMethod.MercadoPago,
            Status = PaymentStatus.Pending,
            Amount = order.Total,
            ExternalId = preferenceId,
        };

        await _context.Payments.AddAsync(payment, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<MercadoPagoPreferenceDto>.Success(new MercadoPagoPreferenceDto(payment.Id, initPoint));
    }
}
