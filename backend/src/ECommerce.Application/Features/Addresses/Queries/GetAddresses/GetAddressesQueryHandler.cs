using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Addresses.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Addresses.Queries.GetAddresses;

public class GetAddressesQueryHandler : IRequestHandler<GetAddressesQuery, Result<List<AddressDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetAddressesQueryHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<AddressDto>>> Handle(GetAddressesQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Result<List<AddressDto>>.Failure("Usuário não autenticado.");

        var addresses = await _context.Addresses
            .Where(a => a.UserId == _currentUser.UserId.Value && !a.IsDeleted)
            .OrderByDescending(a => a.IsDefault)
            .ThenBy(a => a.Label)
            .AsNoTracking()
            .Select(a => new AddressDto(a.Id, a.Label, a.Recipient, a.ZipCode, a.Street, a.Number,
                a.Complement, a.Neighborhood, a.City, a.State, a.Country, a.IsDefault))
            .ToListAsync(cancellationToken);

        return Result<List<AddressDto>>.Success(addresses);
    }
}
