using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Admin.Dashboard.DTOs;
using ECommerce.Application.Features.Admin.Orders.Commands.UpdateOrderStatus;
using ECommerce.Application.Features.Admin.Orders.Queries.GetAllOrders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/admin/orders")]
public class AdminOrdersController : BaseController
{
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<AdminOrderSummaryDto>>> GetAll(
        [FromQuery] string? status,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(
            new GetAllOrdersQuery(status, dateFrom, dateTo, search, page, pageSize),
            cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return Ok(result.Data);
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        [FromBody] UpdateOrderStatusRequest body,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new UpdateOrderStatusCommand(id, body.Status), cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return NoContent();
    }
}

public record UpdateOrderStatusRequest(string Status);
