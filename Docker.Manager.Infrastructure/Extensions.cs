using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Docker.Manager.Infrastructure.Services; 
using Docker.Manager.Core.Services;
using Docker.Manager.Core.Interfaces; 
using badisCore.Common;
using badisCore.Swagger;

namespace Docker.Manager.Infrastructure
{
    public static class Extensions
    {
        public static IBadisCoreBuilder AddInfrastructure(this IBadisCoreBuilder builder)
        {
            builder.Services.AddSingleton<IDbInitializerService, DbInitializerService>();

            builder.Services.AddSingleton<IDockerHubService, DockerHubService>();

       //     builder.Services.AddSingleton<IPrivateRegistryService, PrivateRegistryService>();

       //     builder.Services.AddSingleton<IDockifyK8Service, DockifyK8Service>();

            //    builder.Services.AddSingleton<INewKeyValueSecrets, NewKeyValueSecrets>();
            //    builder.Services.AddSingleton<IDnsService, DnsService>();

            builder.Services.AddSignalR();

            return builder.AddSwaggerDocs();

        }
        public static IApplicationBuilder UseInfrastructure(this IApplicationBuilder app)
        {
            app.UseSwaggerDocs();

            return app;
        }
    }
}
