using ECommerce.Application.Features.Notifications.Commands.MarkAllAsRead;
using ECommerce.Application.Features.Notifications.Commands.MarkAsRead;
using ECommerce.Application.Features.Notifications.Queries.GetNotifications;
using ECommerce.Application.Features.Notifications.Queries.GetUnreadCount;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[Authorize]
public class NotificationsController : BaseController
{
    /// <summary>Lista as notificações do usuário autenticado (não lidas primeiro).</summary>
    [HttpGet]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetNotificationsQuery(page, pageSize), cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return Ok(result.Data);
    }

    /// <summary>Retorna a contagem de notificações não lidas.</summary>
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetUnreadCountQuery(), cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return Ok(new { count = result.Data });
    }

    /// <summary>Marca uma notificação específica como lida.</summary>
    [HttpPut("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new MarkAsReadCommand(id), cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return NoContent();
    }

    /// <summary>Marca todas as notificações do usuário como lidas.</summary>
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new MarkAllAsReadCommand(), cancellationToken);
        if (!result.Succeeded) return BadRequest(new { errors = result.Errors });
        return NoContent();
    }
}
