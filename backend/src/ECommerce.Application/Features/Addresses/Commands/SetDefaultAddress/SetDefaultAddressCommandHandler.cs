using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Addresses.Commands.SetDefaultAddress;

public class SetDefaultAddressCommandHandler : IRequestHandler<SetDefaultAddressCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public SetDefaultAddressCommandHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(SetDefaultAddressCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Result.Failure("Usuário não autenticado.");

        var addresses = await _context.Addresses
            .Where(a => a.UserId == _currentUser.UserId.Value && !a.IsDeleted)
            .ToListAsync(cancellationToken);

        var target = addresses.FirstOrDefault(a => a.Id == request.Id);
        if (target is null)
            return Result.Failure("Endereço não encontrado.");

        addresses.ForEach(a => a.IsDefault = false);
        target.IsDefault = true;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
