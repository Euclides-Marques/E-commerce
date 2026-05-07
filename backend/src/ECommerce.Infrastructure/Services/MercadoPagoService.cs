using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using ECommerce.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ECommerce.Infrastructure.Services;

public class MercadoPagoService : IMercadoPagoService
{
    private readonly HttpClient _httpClient;
    private readonly string _webhookSecret;
    private readonly string _backUrl;
    private readonly ILogger<MercadoPagoService> _logger;

    public MercadoPagoService(HttpClient httpClient, IConfiguration configuration, ILogger<MercadoPagoService> logger)
    {
        _logger = logger;
        _webhookSecret = configuration["MercadoPago:WebhookSecret"] ?? string.Empty;
        _backUrl = configuration["MercadoPago:BackUrl"] ?? "https://novastore-smoky.vercel.app";

        var accessToken = configuration["MercadoPago:AccessToken"] ?? string.Empty;
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri("https://api.mercadopago.com");
        _httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", accessToken);
    }

    public async Task<(string PreferenceId, string InitPoint)> CreatePreferenceAsync(
        decimal amount, Guid orderId, string description, CancellationToken cancellationToken = default)
    {
        var body = new
        {
            items = new[]
            {
                new
                {
                    id = orderId.ToString(),
                    title = description,
                    quantity = 1,
                    unit_price = Math.Round((double)amount, 2),
                    currency_id = "BRL",
                }
            },
            external_reference = orderId.ToString(),
            back_urls = new
            {
                success = $"{_backUrl}/orders",
                failure = $"{_backUrl}/orders",
                pending = $"{_backUrl}/orders",
            },
            auto_return = "approved",
        };

        var json = JsonSerializer.Serialize(body);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync("/checkout/preferences", content, cancellationToken);
        response.EnsureSuccessStatusCode();

        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
        using var doc = JsonDocument.Parse(responseJson);
        var root = doc.RootElement;

        var preferenceId = root.GetProperty("id").GetString() ?? string.Empty;
        var initPoint = root.GetProperty("init_point").GetString() ?? string.Empty;

        return (preferenceId, initPoint);
    }

    public async Task<(bool IsValid, string? OrderId, string? Status)> ProcessWebhookNotificationAsync(
        string xSignature, string xRequestId, string? dataId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(dataId))
            return (true, null, null);

        if (!string.IsNullOrEmpty(_webhookSecret) && !string.IsNullOrEmpty(xSignature))
        {
            if (!ValidateHmacSignature(xSignature, xRequestId, dataId))
            {
                _logger.LogWarning("MercadoPago webhook assinatura inválida para dataId={DataId}", dataId);
                return (false, null, null);
            }
        }

        try
        {
            var response = await _httpClient.GetAsync($"/v1/payments/{dataId}", cancellationToken);
            if (!response.IsSuccessStatusCode)
                return (true, null, null);

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            var externalRef = root.TryGetProperty("external_reference", out var extRef)
                ? extRef.GetString()
                : null;
            var status = root.TryGetProperty("status", out var s)
                ? s.GetString()
                : null;

            return (true, externalRef, status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao consultar pagamento MercadoPago: {DataId}", dataId);
            return (true, null, null);
        }
    }

    private bool ValidateHmacSignature(string xSignature, string xRequestId, string dataId)
    {
        try
        {
            string? ts = null;
            string? v1 = null;

            foreach (var part in xSignature.Split(','))
            {
                var kv = part.Trim().Split('=', 2);
                if (kv.Length == 2)
                {
                    if (kv[0] == "ts") ts = kv[1];
                    else if (kv[0] == "v1") v1 = kv[1];
                }
            }

            if (ts is null || v1 is null)
                return false;

            var template = $"id:{dataId};request-id:{xRequestId};ts:{ts};";
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_webhookSecret));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(template));
            var computed = Convert.ToHexString(hash).ToLower();

            return computed == v1;
        }
        catch
        {
            return false;
        }
    }
}
