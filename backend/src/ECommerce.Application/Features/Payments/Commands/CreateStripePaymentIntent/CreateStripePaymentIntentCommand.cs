using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Payments.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Payments.Commands.CreateStripePaymentIntent;

public record CreateStripePaymentIntentCommand(Guid OrderId) : IRequest<Result<StripePaymentIntentDto>>;
