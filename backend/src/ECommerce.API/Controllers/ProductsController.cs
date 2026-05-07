using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Products.Commands.CreateProduct;
using ECommerce.Application.Features.Products.Commands.DeleteProduct;
using ECommerce.Application.Features.Products.Commands.DeleteProductImage;
using ECommerce.Application.Features.Products.Commands.SetMainImage;
using ECommerce.Application.Features.Products.Commands.UpdateProduct;
using ECommerce.Application.Features.Products.Commands.UploadProductImage;
using ECommerce.Application.Features.Products.DTOs;
using ECommerce.Application.Features.Products.Queries.GetProductById;
using ECommerce.Application.Features.Products.Queries.GetProductBySlug;
using ECommerce.Application.Features.Products.Queries.GetProducts;
using ECommerce.Application.Features.Products.Queries.GetProductsCursor;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

public class ProductsController : BaseController
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PaginatedResult<ProductSummaryDto>>> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] bool? isFeatured = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = false,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(
            new GetProductsQuery(page, pageSize, search, categoryId, isActive, isFeatured, sortBy, sortDescending),
            cancellationToken);

        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors });

        return Ok(result.Data);
    }

    [HttpGet("cursor")]
    [AllowAnonymous]
    public async Task<ActionResult<CursorPaginatedResult<ProductSummaryDto>>> GetCursor(
        [FromQuery] string? cursor = null,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] decimal? priceMin = null,
        [FromQuery] decimal? priceMax = null,
        [FromQuery] double? ratingMin = null,
        [FromQuery] bool? inStockOnly = null,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(
            new GetProductsCursorQuery(cursor, pageSize, search, categoryId, priceMin, priceMax, ratingMin, inStockOnly),
            cancellationToken);

        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors });

        return Ok(result.Data);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProductDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetProductByIdQuery(id), cancellationToken);

        if (!result.Succeeded)
            return NotFound(new { errors = result.Errors });

        return Ok(result.Data);
    }

    [HttpGet("slug/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProductDto>> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetProductBySlugQuery(slug), cancellationToken);

        if (!result.Succeeded)
            return NotFound(new { errors = result.Errors });

        return Ok(result.Data);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductDto>> Create(
        [FromBody] CreateProductCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors });

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductDto>> Update(
        Guid id,
        [FromBody] UpdateProductCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest(new { errors = new[] { "O Id da rota não corresponde ao Id do body." } });

        var result = await Mediator.Send(command, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors });

        return Ok(result.Data);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new DeleteProductCommand(id), cancellationToken);

        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors });

        return NoContent();
    }

    [HttpPost("{id:guid}/images")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductImageDto>> UploadImage(
        Guid id,
        IFormFile file,
        [FromForm] string? altText = null,
        [FromForm] bool setAsMain = false,
        CancellationToken cancellationToken = default)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { errors = new[] { "Nenhum arquivo enviado." } });

        await using var stream = file.OpenReadStream();
        var command = new UploadProductImageCommand(id, stream, file.FileName, altText, setAsMain);
        var result = await Mediator.Send(command, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors });

        return Ok(result.Data);
    }

    [HttpDelete("{id:guid}/images/{imageId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteImage(
        Guid id,
        Guid imageId,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new DeleteProductImageCommand(imageId), cancellationToken);

        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors });

        return NoContent();
    }

    [HttpPut("{id:guid}/images/{imageId:guid}/main")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SetMainImage(
        Guid id,
        Guid imageId,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new SetMainImageCommand(imageId, id), cancellationToken);

        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors });

        return NoContent();
    }
}
