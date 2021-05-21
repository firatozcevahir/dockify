using System;
using System.IO;
using System.Text.Json;
using Arch.EntityFrameworkCore.UnitOfWork;
using Docker.Manager.Core;
using Docker.Manager.Core.Helpers;
using Docker.Manager.Core.Hubs;
using Docker.Manager.Core.Interfaces;
using Docker.Manager.Infrastructure;
using Docker.Manager.Model.DataContext;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using badisCore.Common;
using badisCore.Common.Types;
using badisCore.Swagger;
using badisCore.Logging;

namespace Docker.Manager.Api
{
    public static class Program
    {
        private static IConfiguration _configuration;

        private static string _allowOrigins = "teknopalasPolicy";

        private static bool _isDevelopment { get; set; }

        public static void Main(string[] args) => CreateHostBuilder(args).Build().Run();

        public static IHostBuilder CreateHostBuilder(string[] args) => Host.CreateDefaultBuilder(args)
            .UseContentRoot(Directory.GetCurrentDirectory())
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder
                     .ConfigureAppConfiguration((hostingContext, config) =>
                     {
                         config
                            .SetBasePath(hostingContext.HostingEnvironment.ContentRootPath)
                            .AddJsonFile("appsettings.json", true, true);

                         config.AddEnvironmentVariables();

                         _isDevelopment = hostingContext.HostingEnvironment.IsDevelopment();

                         _configuration = config.Build();

                     })
                     .ConfigureServices(services => services
                        .AddCoreApp()
                        .AddDockerCoreApp()
                        .AddInfrastructure()
                        .AddSwaggerDocs()

                        .Build()

                        )
                     .ConfigureServices(services =>
                     {
                         services.AddControllers();
                     })
                     .ConfigureServices(services =>
                     {
                         services.AddCors(options =>
                         {
                             options.AddPolicy(_allowOrigins,
                                      builder => builder
                                           .WithOrigins("*").SetIsOriginAllowedToAllowWildcardSubdomains()
                                           .AllowAnyHeader()
                                           .AllowAnyOrigin()
                                           .AllowAnyMethod()
                              );
                         });

                         services.AddSignalR(s => s.EnableDetailedErrors = true)
                               .AddJsonProtocol(options =>
                         {
                             options.PayloadSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                         });

                         services.AddSpaStaticFiles(configuration =>
                         {
                             configuration.RootPath = "wwwroot";
                         });

                     })
                     .ConfigureServices(s =>
                     {
                         s.AddDbContext<DockerDbContext>(options =>
                         {
                             var dbtype = _configuration.GetSection("app:dbtype").Value;

                             var dbLiteSettings = _configuration.GetSection("app:sqlLiteConnectionStrings").Value;

                             var dbSettings = _configuration.GetSection("app:dbConnectionStrings").Value;

                             if (dbtype.Equals(nameof(DbTypes.SqlLite), StringComparison.OrdinalIgnoreCase))
                             {
                                 options.UseSqlite(dbLiteSettings);
                             }
                             else
                             {
                                 options.UseSqlServer(dbSettings, sqlServerOptionsAction: sqlOptions
                                         => sqlOptions.EnableRetryOnFailure(maxRetryCount: 10, maxRetryDelay: TimeSpan.FromSeconds(30), errorNumbersToAdd: null))
                                      .EnableDetailedErrors()
                                      .LogTo(Console.WriteLine)
                                      ;
                             }

                         }).AddAntiforgery().AddUnitOfWork<DockerDbContext>();
                     })

                     .Configure(app => app
                           .UseCoreApp()
                           .UseInfrastructure()
                           .UseStaticFiles()
                           //         .UseHttpsRedirection()
                           .UseDefaultFiles()
                           .UseSwaggerDocs()
                           .UseRouting()
                           .UseAuthentication()
                           .UseCors(_allowOrigins)
                           .UseAuthorization()
                           .UseEndpoints(endpoints =>
                           {
                               endpoints.MapControllers();
                               endpoints.MapGet("", ctx => ctx.Response.WriteAsync(
                                            Figgle.FiggleFonts.Doom.Render(ctx.RequestServices.GetService<AppOptions>().Name))
                                         );

                               endpoints.MapGet("docker/hc", ctx => ctx.Response.WriteAsync("Teknopalas Docker-Manger service is very healthy"));

                               endpoints.MapHub<ProgressHub>("/progresshub",
                                     options => options.Transports = HttpTransportType.WebSockets | HttpTransportType.LongPolling | HttpTransportType.ServerSentEvents);
                           })
                          .UseSpa(spa =>
                          {
                              var scopeFactory = spa.ApplicationBuilder.ApplicationServices.GetRequiredService<IServiceScopeFactory>();
                              using (var scope = scopeFactory.CreateScope())
                              {
                                  var dbInitializer = scope.ServiceProvider.GetService<IDbInitializerService>();
                                  dbInitializer.Initialize();

                              }

                              if (_isDevelopment)
                              {
                                  spa.UseProxyToSpaDevelopmentServer("http://localhost:4200");
                              }

                              /*
                              spa.ApplicationBuilder.UseStaticFiles();
                              spa.ApplicationBuilder.UseSpaStaticFiles();
                              spa.Options.SourcePath = "wwwroot";
                              */

                          })
                          )
                         .UseKestrel(opts =>
                          {
                              opts.Limits.MaxConcurrentConnections = 100;
                              opts.Limits.MaxConcurrentUpgradedConnections = 100;
                              opts.AddServerHeader = false;
                              opts.ListenAnyIP(7001);
                          })
                          // .UseIIS()
                          //.UseIISIntegration()
                          .UseBadisLogging();
            });
    }
}
