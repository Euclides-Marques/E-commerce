using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Notifications.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Notifications.Queries.GetNotifications;

public class GetNotificationsQueryHandler
    : IRequestHandler<GetNotificationsQuery, Result<PaginatedResult<NotificationDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetNotificationsQueryHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<PaginatedResult<NotificationDto>>> Handle(
        GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Result<PaginatedResult<NotificationDto>>.Failure("Usuário não autenticado.");

        var query = _context.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == _currentUser.UserId.Value && !n.IsDeleted)
            .OrderBy(n => n.IsRead)
            .ThenByDescending(n => n.CreatedAt);

        var total = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling(total / (double)request.PageSize);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(n => new NotificationDto(
                n.Id,
                n.Title,
                n.Message,
                n.Type.ToString(),
                n.IsRead,
                n.ReadAt,
                n.OrderId,
                n.RelatedUrl,
                n.CreatedAt))
            .ToListAsync(cancellationToken);

        return Result<PaginatedResult<NotificationDto>>.Success(
            new PaginatedResult<NotificationDto>(items, total, request.Page, request.PageSize, totalPages));
    }
}
