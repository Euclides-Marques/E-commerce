using System.Text.Json;
using ECommerce.Application.Common.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace ECommerce.Infrastructure.Services;

public class CacheService : ICacheService
{
    private readonly IDistributedCache _cache;
    private readonly IConnectionMultiplexer? _redis;
    private readonly ILogger<CacheService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public CacheService(IDistributedCache cache, ILogger<CacheService> logger, IConnectionMultiplexer? redis = null)
    {
        _cache = cache;
        _redis = redis;
        _logger = logger;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var value = await _cache.GetStringAsync(key, cancellationToken);
            return value is null ? default : JsonSerializer.Deserialize<T>(value, JsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao ler cache para chave '{Key}'", key);
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiry ?? TimeSpan.FromMinutes(30)
            };
            var json = JsonSerializer.Serialize(value, JsonOptions);
            await _cache.SetStringAsync(key, json, options, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao escrever cache para chave '{Key}'", key);
        }
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            await _cache.RemoveAsync(key, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao remover cache para chave '{Key}'", key);
        }
    }

    public async Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default)
    {
        if (_redis is null)
        {
            // Sem Redis disponível: não há como fazer SCAN em memória distribuída
            _logger.LogDebug("RemoveByPatternAsync ignorado — Redis não configurado (padrão: '{Pattern}')", pattern);
            return;
        }

        try
        {
            // Usa SCAN no servidor Redis para localizar e remover chaves pelo padrão
            // Seguro para Redis standalone (Neon, ElastiCache single-node, etc.)
            var db = _redis.GetDatabase();
            var server = _redis.GetServers().FirstOrDefault(s => !s.IsReplica);
            if (server is null) return;

            var redisPattern = $"{pattern}*";
            var keys = new List<RedisKey>();

            await foreach (var key in server.KeysAsync(pattern: redisPattern, pageSize: 250))
            {
                keys.Add(key);
                if (keys.Count >= 500)
                {
                    await db.KeyDeleteAsync(keys.ToArray());
                    keys.Clear();
                }
            }

            if (keys.Count > 0)
                await db.KeyDeleteAsync(keys.ToArray());
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao remover cache por padrão '{Pattern}'", pattern);
        }
    }
}
