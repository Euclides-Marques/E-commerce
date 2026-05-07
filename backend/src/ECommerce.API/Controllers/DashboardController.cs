using ECommerce.Application.Features.Admin.Dashboard.DTOs;
using ECommerce.Application.Features.Admin.Dashboard.Queries.GetDashboardSummary;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Authorize(Roles = "Admin")]
public class DashboardController : BaseController
{
    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary(
        [FromQuery] int daysBack = 30,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetDashboardSummaryQuery(daysBack), cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return Ok(result.Data);
    }
}
