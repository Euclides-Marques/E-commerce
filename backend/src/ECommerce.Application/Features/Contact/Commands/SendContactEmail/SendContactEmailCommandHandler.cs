using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using MediatR;

namespace ECommerce.Application.Features.Contact.Commands.SendContactEmail;

public class SendContactEmailCommandHandler : IRequestHandler<SendContactEmailCommand, Result<bool>>
{
    private readonly IEmailService _emailService;

    public SendContactEmailCommandHandler(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task<Result<bool>> Handle(SendContactEmailCommand request, CancellationToken cancellationToken)
    {
        await _emailService.SendContactAsync(
            request.Name,
            request.Email,
            request.Subject,
            request.Message,
            cancellationToken);

        return Result<bool>.Success(true);
    }
}
