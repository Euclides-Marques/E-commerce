using FluentValidation;

namespace ECommerce.Application.Features.Contact.Commands.SendContactEmail;

public class SendContactEmailCommandValidator : AbstractValidator<SendContactEmailCommand>
{
    public SendContactEmailCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nome é obrigatório.")
            .MaximumLength(100).WithMessage("Nome deve ter no máximo 100 caracteres.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-mail é obrigatório.")
            .EmailAddress().WithMessage("E-mail inválido.");

        RuleFor(x => x.Subject)
            .NotEmpty().WithMessage("Assunto é obrigatório.")
            .MaximumLength(200).WithMessage("Assunto deve ter no máximo 200 caracteres.");

        RuleFor(x => x.Message)
            .NotEmpty().WithMessage("Mensagem é obrigatória.")
            .MaximumLength(2000).WithMessage("Mensagem deve ter no máximo 2000 caracteres.");
    }
}
