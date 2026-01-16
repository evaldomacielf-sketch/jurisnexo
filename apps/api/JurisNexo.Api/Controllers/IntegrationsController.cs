using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace JurisNexo.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/integrations")]
    public class IntegrationsController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        // In a real app, we would inject a Service that manages Tenants' settings in DB.
        // For this demo/MVP, we rely on IConfiguration (appsettings + env vars).
        // Since we cannot easily write to appsettings at runtime in production usually, 
        // we might mock the "Get" to return what's in config, and "Post" to just return OK 
        // (or ideally save to a TenantSettings table if we had one).
        // Given I implemented ICRMIntegrationService using IConfiguration, 
        // I will assume for this Dashboard that we are just Reading status.
        // Or I can simulate saving to DB if I had a TenantSettings table.
        // For now, I will Return Mock Status derived from Config presence.
        
        public IntegrationsController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet("crm")]
        public ActionResult<Dictionary<string, dynamic>> GetCRMStatus()
        {
            var status = new Dictionary<string, dynamic>
            {
                ["salesforce"] = new { enabled = !string.IsNullOrEmpty(_configuration["Salesforce:ClientId"]) },
                ["hubspot"] = new { enabled = !string.IsNullOrEmpty(_configuration["HubSpot:ApiKey"]) },
                ["pipedrive"] = new { enabled = !string.IsNullOrEmpty(_configuration["Pipedrive:ApiToken"]) },
                ["rdstation"] = new { enabled = !string.IsNullOrEmpty(_configuration["RDStation:ClientId"]) }
            };

            return Ok(status);
        }

        [HttpPost("crm/{provider}")]
        public ActionResult UpdateCRMConfig(string provider, [FromBody] Dictionary<string, string> config)
        {
            // In a real scenario, save to DB (TenantSettings).
            // Here we just acknowledge.
            return Ok(new { success = true, message = $"Configuration for {provider} updated (Simulation)" });
        }
    }
}
