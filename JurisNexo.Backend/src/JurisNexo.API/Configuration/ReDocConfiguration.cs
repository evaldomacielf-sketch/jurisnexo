using Microsoft.AspNetCore.Builder;
using Swashbuckle.AspNetCore.ReDoc;

namespace JurisNexo.API.Configuration;

public static class ReDocConfiguration
{
    public static IApplicationBuilder UseReDocDocumentation(this IApplicationBuilder app)
    {
        app.UseReDoc(options =>
        {
            options.DocumentTitle = "JurisNexo API Documentation";
            options.SpecUrl = "/api/docs/v1/swagger.json";
            options.RoutePrefix = "api/redoc";
            options.EnableUntrustedSpec();
            options.ScrollYOffset(10);
            options.HideHostname();
            options.HideDownloadButton();
            options.ExpandResponses("200,201");
            options.RequiredPropsFirst();
            options.NoAutoAuth();
            options.PathInMiddlePanel();
            options.HideLoading();
            options.NativeScrollbars();
            options.DisableSearch();
            options.OnlyRequiredInSamples();
        });

        return app;
    }
}
