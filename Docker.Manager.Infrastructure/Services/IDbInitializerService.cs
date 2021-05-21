using Docker.Manager.Core.Interfaces;
using Docker.Manager.Model.DataContext;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace Docker.Manager.Infrastructure.Services
{  
    public class DbInitializerService : IDbInitializerService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public DbInitializerService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        public void Initialize()
        {
            try
            {
                using (var serviceScope = _scopeFactory.CreateScope())
                {
                    using (var context = serviceScope.ServiceProvider.GetService<DockerDbContext>())
                    {
                      context.Database.Migrate();
                    }
                }
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(ex.Message.ToString());
            }
        }

    }

}
