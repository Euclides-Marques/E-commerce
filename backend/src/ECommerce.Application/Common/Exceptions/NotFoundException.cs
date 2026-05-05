namespace ECommerce.Application.Common.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(string name, object key)
        : base($"Entidade \"{name}\" ({key}) não encontrada.") { }

    public NotFoundException(string message) : base(message) { }
}