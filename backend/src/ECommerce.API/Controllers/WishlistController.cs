using ECommerce.Application.Features.Wishlist.Commands.ToggleWishlist;
using ECommerce.Application.Features.Wishlist.DTOs;
using ECommerce.Application.Features.Wishlist.Queries.GetWishlist;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Authorize]
public class WishlistController : BaseController
{
    [HttpGet]
    public async Task<ActionResult<List<WishlistItemDto>>> GetWishlist(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetWishlistQuery(), cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<ActionResult<ToggleWishlistResult>> Toggle([FromBody] ToggleWishlistRequest body, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new ToggleWishlistCommand(body.ProductId), cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return Ok(result.Data);
    }

    [HttpDelete("{productId:guid}")]
    public async Task<ActionResult<ToggleWishlistResult>> Remove(Guid productId, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new ToggleWishlistCommand(productId), cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return Ok(result.Data);
    }
}

public record ToggleWishlistRequest(Guid ProductId);
