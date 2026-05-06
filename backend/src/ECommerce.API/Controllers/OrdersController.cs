using ECommerce.Application.Features.Orders.Commands.CancelOrder;
using ECommerce.Application.Features.Orders.Commands.PlaceOrder;
using ECommerce.Application.Features.Orders.DTOs;
using ECommerce.Application.Features.Orders.Queries.GetOrderById;
using ECommerce.Application.Features.Orders.Queries.GetOrders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Authorize]
public class OrdersController : BaseController
{
    [HttpGet]
    public async Task<ActionResult<List<OrderSummaryDto>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetOrdersQuery(), cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return Ok(result.Data);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetOrderByIdQuery(id), cancellationToken);
        if (!result.Succeeded) return NotFound(new { errors = result.Errors });
        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> PlaceOrder([FromBody] PlaceOrderCommand command, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new CancelOrderCommand(id), cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return NoContent();
    }
}
