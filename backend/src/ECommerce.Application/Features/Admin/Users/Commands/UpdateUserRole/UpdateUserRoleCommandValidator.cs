using ECommerce.Domain.Enums;
using FluentValidation;

namespace ECommerce.Application.Features.Admin.Users.Commands.UpdateUserRole;

public class UpdateUserRoleCommandValidator : AbstractValidator<UpdateUserRoleCommand>
{
    private static readonly string[] ValidRoles = Enum.GetNames<UserRole>();

    public UpdateUserRoleCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("Id do usuário é obrigatório.");

        RuleFor(x => x.Role)
            .NotEmpty().WithMessage("Papel é obrigatório.")
            .Must(r => ValidRoles.Contains(r, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Papel inválido. Valores aceitos: {string.Join(", ", ValidRoles)}.");
    }
}
