using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Admin.Dashboard.DTOs;
using ECommerce.Application.Features.Admin.Users.Commands.ToggleUserActive;
using ECommerce.Application.Features.Admin.Users.Commands.UpdateUserRole;
using ECommerce.Application.Features.Admin.Users.Queries.GetAllUsers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/admin/users")]
public class AdminUsersController : BaseController
{
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<AdminUserDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetAllUsersQuery(search, page, pageSize), cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return Ok(result.Data);
    }

    [HttpPut("{id:guid}/role")]
    public async Task<IActionResult> UpdateRole(
        Guid id,
        [FromBody] UpdateUserRoleRequest body,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new UpdateUserRoleCommand(id, body.Role), cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return NoContent();
    }

    [HttpPut("{id:guid}/toggle-active")]
    public async Task<IActionResult> ToggleActive(Guid id, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new ToggleUserActiveCommand(id), cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return NoContent();
    }
}

public record UpdateUserRoleRequest(string Role);
