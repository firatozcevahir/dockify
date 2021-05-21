
using badisCore.Common;
using badisCore.Swagger;
using Dockify.K8.Api.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace Dockify.K8.APi
{
    public static class Extensions
    {
        public static IBadisCoreBuilder AddPrivateRegistry(this IBadisCoreBuilder builder)
        {
            builder.Services.AddSingleton<DockifyK8Service, DockifyK8Service>();

            return builder.AddSwaggerDocs();

        }
        public static IApplicationBuilder UsePrivateRegistry(this IApplicationBuilder app)
        {
            app.UseSwaggerDocs();
            return app;
        }
    }
}
