using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Admin.Dashboard.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Admin.Users.Queries.GetAllUsers;

public record GetAllUsersQuery(
    string? Search,
    int Page = 1,
    int PageSize = 20
) : IRequest<Result<PaginatedResult<AdminUserDto>>>;
