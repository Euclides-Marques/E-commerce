using ECommerce.Domain.Enums;
using FluentValidation;

namespace ECommerce.Application.Features.Admin.Orders.Commands.UpdateOrderStatus;

public class UpdateOrderStatusCommandValidator : AbstractValidator<UpdateOrderStatusCommand>
{
    private static readonly string[] ValidStatuses = Enum.GetNames<OrderStatus>();

    public UpdateOrderStatusCommandValidator()
    {
        RuleFor(x => x.OrderId)
            .NotEmpty().WithMessage("Id do pedido é obrigatório.");

        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("Status é obrigatório.")
            .Must(s => ValidStatuses.Contains(s, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Status inválido. Valores aceitos: {string.Join(", ", ValidStatuses)}.");
    }
}
