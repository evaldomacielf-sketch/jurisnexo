using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using JurisNexo.Infrastructure.Data;

namespace JurisNexo.API.Controllers;

[ApiController]
[Route("health")]
[ApiExplorerSettings(IgnoreApi = true)]
public class HealthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IDistributedCache _cache;
    private readonly ILogger<HealthController> _logger;

    public HealthController(
        ApplicationDbContext context,
        IDistributedCache cache,
        ILogger<HealthController> logger)
    {
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
    }

    [HttpGet("ready")]
    public async Task<IActionResult> Ready()
    {
        try
        {
            // Check database
            await _context.Database.CanConnectAsync();

            // Check Redis
            await _cache.SetStringAsync("health-check", "ok", new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(10)
            });

            return Ok(new
            {
                status = "ready",
                checks = new
                {
                    database = "healthy",
                    cache = "healthy"
                },
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed");
            return StatusCode(503, new { status = "unhealthy", error = ex.Message });
        }
    }

    [HttpGet("live")]
    public IActionResult Live()
    {
        return Ok(new { status = "alive", timestamp = DateTime.UtcNow });
    }
}
