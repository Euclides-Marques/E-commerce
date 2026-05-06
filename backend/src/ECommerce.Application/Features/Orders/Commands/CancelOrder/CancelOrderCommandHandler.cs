using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Orders.Commands.CancelOrder;

public class CancelOrderCommandHandler : IRequestHandler<CancelOrderCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CancelOrderCommandHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(CancelOrderCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Result.Failure("Usuário não autenticado.");

        var order = await _context.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.UserId == _currentUser.UserId.Value && !o.IsDeleted, cancellationToken);

        if (order is null)
            return Result.Failure("Pedido não encontrado.");

        if (order.Status != OrderStatus.Pending)
            return Result.Failure("Somente pedidos com status 'Pendente' podem ser cancelados.");

        order.Status = OrderStatus.Cancelled;

        foreach (var item in order.Items)
        {
            item.Product.StockQuantity += item.Quantity;
            item.Product.SoldCount -= item.Quantity;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
