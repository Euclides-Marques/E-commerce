using ECommerce.Application.Features.Reviews.Commands.CreateProductReview;
using ECommerce.Application.Features.Reviews.Commands.DeleteProductReview;
using ECommerce.Application.Features.Reviews.Commands.MarkReviewHelpful;
using ECommerce.Application.Features.Reviews.DTOs;
using ECommerce.Application.Features.Reviews.Queries.GetProductReviews;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

public class ReviewsController : BaseController
{
    [AllowAnonymous]
    [HttpGet("/api/products/{productId:guid}/reviews")]
    public async Task<ActionResult<ReviewSummaryDto>> GetProductReviews(
        Guid productId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetProductReviewsQuery(productId, page, pageSize), cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return Ok(result.Data);
    }

    [Authorize]
    [HttpPost("/api/products/{productId:guid}/reviews")]
    public async Task<ActionResult<ReviewDto>> CreateReview(
        Guid productId,
        [FromBody] CreateProductReviewRequest body,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(
            new CreateProductReviewCommand(productId, body.Rating, body.Title, body.Comment),
            cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return CreatedAtAction(nameof(GetProductReviews), new { productId }, result.Data);
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteReview(Guid id, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new DeleteProductReviewCommand(id), cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return NoContent();
    }

    [Authorize]
    [HttpPost("{id:guid}/helpful")]
    public async Task<IActionResult> MarkHelpful(Guid id, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new MarkReviewHelpfulCommand(id), cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return NoContent();
    }
}

public record CreateProductReviewRequest(int Rating, string? Title, string? Comment);
