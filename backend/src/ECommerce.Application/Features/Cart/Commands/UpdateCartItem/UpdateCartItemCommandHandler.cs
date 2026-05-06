using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Cart.DTOs;
using ECommerce.Application.Features.Cart.Queries.GetCart;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Cart.Commands.UpdateCartItem;

public class UpdateCartItemCommandHandler : IRequestHandler<UpdateCartItemCommand, Result<CartDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly ISender _sender;

    public UpdateCartItemCommandHandler(IApplicationDbContext context, ICurrentUser currentUser, ISender sender)
    {
        _context = context;
        _currentUser = currentUser;
        _sender = sender;
    }

    public async Task<Result<CartDto>> Handle(UpdateCartItemCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Result<CartDto>.Failure("Usuário não autenticado.");

        var item = await _context.CartItems
            .FirstOrDefaultAsync(c => c.UserId == _currentUser.UserId.Value && c.ProductId == request.ProductId, cancellationToken);

        if (item is null)
            return Result<CartDto>.Failure("Item não encontrado no carrinho.");

        if (request.Quantity == 0)
            _context.CartItems.Remove(item);
        else
            item.Quantity = request.Quantity;

        await _context.SaveChangesAsync(cancellationToken);
        return await _sender.Send(new GetCartQuery(), cancellationToken);
    }
}
