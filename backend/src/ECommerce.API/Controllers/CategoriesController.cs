using ECommerce.Application.Features.Categories.DTOs;
using ECommerce.Application.Features.Categories.Queries.GetCategories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[AllowAnonymous]
public class CategoriesController : BaseController
{
    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetAll(
        [FromQuery] bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetCategoriesQuery(isActive), cancellationToken);

        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors });

        return Ok(result.Data);
    }
}
