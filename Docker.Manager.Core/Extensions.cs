
using badisCore.Common;
using badisCore.Swagger;

namespace Docker.Manager.Core
{
    public static class Extensions
    {
        public static IBadisCoreBuilder AddDockerCoreApp(this IBadisCoreBuilder builder)
            => builder
                .AddSwaggerDocs();
    }
}
