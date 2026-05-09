using ECommerce.Application.Common.Models;
using MediatR;

namespace ECommerce.Application.Features.Contact.Commands.SendContactEmail;

public record SendContactEmailCommand(
    string Name,
    string Email,
    string Subject,
    string Message
) : IRequest<Result<bool>>;
