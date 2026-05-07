using ECommerce.Application.Common.Models;
using MediatR;

namespace ECommerce.Application.Features.Payments.Commands.HandleStripeWebhook;

public record HandleStripeWebhookCommand(string Payload, string Signature) : IRequest<Result>;
