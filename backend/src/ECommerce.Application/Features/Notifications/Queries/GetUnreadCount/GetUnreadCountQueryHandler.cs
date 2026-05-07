using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Notifications.Queries.GetUnreadCount;

public class GetUnreadCountQueryHandler : IRequestHandler<GetUnreadCountQuery, Result<int>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetUnreadCountQueryHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<int>> Handle(GetUnreadCountQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Result<int>.Success(0);

        var count = await _context.Notifications
            .AsNoTracking()
            .CountAsync(n =>
                n.UserId == _currentUser.UserId.Value &&
                !n.IsRead &&
                !n.IsDeleted,
                cancellationToken);

        return Result<int>.Success(count);
    }
}
