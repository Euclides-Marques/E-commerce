using ECommerce.Application.Common.Models;
using MediatR;

namespace ECommerce.Application.Features.Payments.Commands.HandleMercadoPagoWebhook;

public record HandleMercadoPagoWebhookCommand(
    string Payload,
    string XSignature,
    string XRequestId,
    string? DataId) : IRequest<Result>;
