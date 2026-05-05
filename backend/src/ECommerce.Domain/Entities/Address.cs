using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class Address : AuditableEntity
{
    public Guid UserId { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Recipient { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string Number { get; set; } = string.Empty;
    public string? Complement { get; set; }
    public string Neighborhood { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = "Brasil";
    public bool IsDefault { get; set; } = false;

    public User User { get; set; } = null!;
}
