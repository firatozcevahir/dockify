using Docker.Manager.Model.DataContext;
using Microsoft.EntityFrameworkCore;
using Polly;
using System; 

namespace Docker.Manager.Model
{
    public static class DBInitializer
    {
        public static void Initialize<T>(DbContext context)
        {
            Policy
            .Handle<Exception>()
            .WaitAndRetry(5, r => TimeSpan.FromSeconds(5), (ex, ts) => { Console.WriteLine("Error connecting to DB. Retrying in 5 sec."); })
            .Execute(() => context.Database.EnsureCreated());

        }
    }
}
