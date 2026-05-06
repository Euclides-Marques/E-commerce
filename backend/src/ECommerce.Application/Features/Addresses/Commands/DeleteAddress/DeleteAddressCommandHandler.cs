using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Addresses.Commands.DeleteAddress;

public class DeleteAddressCommandHandler : IRequestHandler<DeleteAddressCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public DeleteAddressCommandHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(DeleteAddressCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Result.Failure("Usuário não autenticado.");

        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.Id == request.Id && a.UserId == _currentUser.UserId.Value && !a.IsDeleted, cancellationToken);

        if (address is null)
            return Result.Failure("Endereço não encontrado.");

        address.IsDeleted = true;
        address.DeletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
