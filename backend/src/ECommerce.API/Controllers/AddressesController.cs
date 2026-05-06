using ECommerce.Application.Features.Addresses.Commands.CreateAddress;
using ECommerce.Application.Features.Addresses.Commands.DeleteAddress;
using ECommerce.Application.Features.Addresses.Commands.SetDefaultAddress;
using ECommerce.Application.Features.Addresses.Commands.UpdateAddress;
using ECommerce.Application.Features.Addresses.DTOs;
using ECommerce.Application.Features.Addresses.Queries.GetAddresses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Authorize]
public class AddressesController : BaseController
{
    [HttpGet]
    public async Task<ActionResult<List<AddressDto>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new GetAddressesQuery(), cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<ActionResult<AddressDto>> Create([FromBody] CreateAddressCommand command, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return CreatedAtAction(nameof(GetAll), result.Data);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<AddressDto>> Update(Guid id, [FromBody] UpdateAddressBody body, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new UpdateAddressCommand(id, body.Label, body.Recipient, body.ZipCode,
            body.Street, body.Number, body.Complement, body.Neighborhood, body.City, body.State, body.Country, body.IsDefault), cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return Ok(result.Data);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new DeleteAddressCommand(id), cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return NoContent();
    }

    [HttpPost("{id:guid}/set-default")]
    public async Task<IActionResult> SetDefault(Guid id, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(new SetDefaultAddressCommand(id), cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return NoContent();
    }
}

public record UpdateAddressBody(
    string Label,
    string Recipient,
    string ZipCode,
    string Street,
    string Number,
    string? Complement,
    string Neighborhood,
    string City,
    string State,
    string Country,
    bool IsDefault
);
