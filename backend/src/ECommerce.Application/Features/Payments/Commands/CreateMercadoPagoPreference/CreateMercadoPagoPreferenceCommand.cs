using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Payments.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Payments.Commands.CreateMercadoPagoPreference;

public record CreateMercadoPagoPreferenceCommand(Guid OrderId) : IRequest<Result<MercadoPagoPreferenceDto>>;
