using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Addresses.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Addresses.Commands.UpdateAddress;

public class UpdateAddressCommandHandler : IRequestHandler<UpdateAddressCommand, Result<AddressDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public UpdateAddressCommandHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<AddressDto>> Handle(UpdateAddressCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Result<AddressDto>.Failure("Usuário não autenticado.");

        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.Id == request.Id && a.UserId == _currentUser.UserId.Value && !a.IsDeleted, cancellationToken);

        if (address is null)
            return Result<AddressDto>.Failure("Endereço não encontrado.");

        if (request.IsDefault && !address.IsDefault)
        {
            var others = await _context.Addresses
                .Where(a => a.UserId == _currentUser.UserId.Value && a.IsDefault && a.Id != address.Id && !a.IsDeleted)
                .ToListAsync(cancellationToken);
            others.ForEach(a => a.IsDefault = false);
        }

        address.Label = request.Label;
        address.Recipient = request.Recipient;
        address.ZipCode = request.ZipCode;
        address.Street = request.Street;
        address.Number = request.Number;
        address.Complement = request.Complement;
        address.Neighborhood = request.Neighborhood;
        address.City = request.City;
        address.State = request.State;
        address.Country = request.Country;
        address.IsDefault = request.IsDefault;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<AddressDto>.Success(new AddressDto(address.Id, address.Label, address.Recipient,
            address.ZipCode, address.Street, address.Number, address.Complement, address.Neighborhood,
            address.City, address.State, address.Country, address.IsDefault));
    }
}
