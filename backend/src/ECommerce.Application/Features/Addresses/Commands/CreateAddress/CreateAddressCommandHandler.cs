using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Addresses.DTOs;
using ECommerce.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Addresses.Commands.CreateAddress;

public class CreateAddressCommandHandler : IRequestHandler<CreateAddressCommand, Result<AddressDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CreateAddressCommandHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<AddressDto>> Handle(CreateAddressCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Result<AddressDto>.Failure("Usuário não autenticado.");

        if (request.IsDefault)
        {
            var existing = await _context.Addresses
                .Where(a => a.UserId == _currentUser.UserId.Value && a.IsDefault && !a.IsDeleted)
                .ToListAsync(cancellationToken);
            existing.ForEach(a => a.IsDefault = false);
        }

        var address = new Address
        {
            UserId = _currentUser.UserId.Value,
            Label = request.Label,
            Recipient = request.Recipient,
            ZipCode = request.ZipCode,
            Street = request.Street,
            Number = request.Number,
            Complement = request.Complement,
            Neighborhood = request.Neighborhood,
            City = request.City,
            State = request.State,
            Country = request.Country,
            IsDefault = request.IsDefault,
        };

        await _context.Addresses.AddAsync(address, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<AddressDto>.Success(new AddressDto(address.Id, address.Label, address.Recipient,
            address.ZipCode, address.Street, address.Number, address.Complement, address.Neighborhood,
            address.City, address.State, address.Country, address.IsDefault));
    }
}
