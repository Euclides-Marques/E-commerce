using ECommerce.Application.Features.Contact.Commands.SendContactEmail;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[AllowAnonymous]
public class ContactController : BaseController
{
    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] SendContactEmailCommand command)
    {
        var result = await Mediator.Send(command);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors });
        return Ok();
    }
}
