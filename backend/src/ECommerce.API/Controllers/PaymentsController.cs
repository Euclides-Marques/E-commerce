using ECommerce.Application.Features.Payments.Commands.CreateMercadoPagoPreference;
using ECommerce.Application.Features.Payments.Commands.CreateStripePaymentIntent;
using ECommerce.Application.Features.Payments.Commands.HandleMercadoPagoWebhook;
using ECommerce.Application.Features.Payments.Commands.HandleStripeWebhook;
using ECommerce.Application.Features.Payments.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Authorize]
public class PaymentsController : BaseController
{
    [HttpPost("stripe/create-intent")]
    public async Task<ActionResult<StripePaymentIntentDto>> CreateStripePaymentIntent(
        [FromBody] CreateStripePaymentIntentCommand command, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return Ok(result.Data);
    }

    [HttpPost("mercadopago/create-preference")]
    public async Task<ActionResult<MercadoPagoPreferenceDto>> CreateMercadoPagoPreference(
        [FromBody] CreateMercadoPagoPreferenceCommand command, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return Ok(result.Data);
    }

    [AllowAnonymous]
    [HttpPost("stripe/webhook")]
    public async Task<IActionResult> StripeWebhook(CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(HttpContext.Request.Body);
        var payload = await reader.ReadToEndAsync(cancellationToken);
        var signature = Request.Headers["Stripe-Signature"].ToString();
        var result = await Mediator.Send(new HandleStripeWebhookCommand(payload, signature), cancellationToken);
        if (!result.Succeeded) return BadRequest();
        return Ok();
    }

    [AllowAnonymous]
    [HttpPost("mercadopago/webhook")]
    public async Task<IActionResult> MercadoPagoWebhook(
        [FromQuery(Name = "data.id")] string? dataId,
        [FromQuery] string? id,
        CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(HttpContext.Request.Body);
        var payload = await reader.ReadToEndAsync(cancellationToken);
        var xSignature = Request.Headers["x-signature"].ToString();
        var xRequestId = Request.Headers["x-request-id"].ToString();
        var actualDataId = dataId ?? id;
        var result = await Mediator.Send(
            new HandleMercadoPagoWebhookCommand(payload, xSignature, xRequestId, actualDataId),
            cancellationToken);
        if (!result.Succeeded) return BadRequest();
        return Ok();
    }
}
