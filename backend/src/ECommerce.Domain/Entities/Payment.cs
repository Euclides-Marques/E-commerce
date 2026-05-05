using ECommerce.Domain.Common;
using ECommerce.Domain.Enums;

namespace ECommerce.Domain.Entities;

public class Payment : AuditableEntity
{
    public Guid OrderId { get; set; }
    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public decimal Amount { get; set; }
    public string? ExternalId { get; set; }
    public string? ExternalStatus { get; set; }
    public string? PixCode { get; set; }
    public string? PixQrCodeUrl { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? FailureReason { get; set; }
    public string? GatewayResponse { get; set; }

    public Order Order { get; set; } = null!;
}
