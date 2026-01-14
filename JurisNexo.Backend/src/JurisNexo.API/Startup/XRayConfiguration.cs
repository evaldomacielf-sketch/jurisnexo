using Amazon.XRay.Recorder.Core;
using Amazon.XRay.Recorder.Handlers.AwsSdk;
using Amazon.XRay.Recorder.Handlers.System.Net;
using Microsoft.Extensions.DependencyInjection;

namespace JurisNexo.API.Startup;

public static class XRayConfiguration
{
    public static IServiceCollection AddXRayTracing(this IServiceCollection services)
    {
        // Configure AWS X-Ray Recorder
        AWSXRayRecorder.InitializeInstance(); // Initialize the global instance

        // services.AddAWSXRayRecorder(options =>
        // {
        //     options.PluginSetting = new PluginSetting
        //     {
        //         EC2Plugin = false,
        //         ECSPlugin = true,
        //         ElasticBeanstalkPlugin = false
        //     };
        // });

        // Add X-Ray to HTTP clients to trace downstream HTTP calls
        // services.AddHttpClient("XRayClient")
        //    .AddXRayHttpClientInstrumentation();

        // Also register AWSSDK instrumentation globally
        AWSSDKHandler.RegisterXRayForAllServices();

        return services;
    }

    public static IApplicationBuilder UseXRayTracing(this IApplicationBuilder app)
    {
        // Register the X-Ray middleware
        // The parameter is the segment name, usually the application name
        app.UseXRay("JurisNexo.API");
        
        return app;
    }
}
