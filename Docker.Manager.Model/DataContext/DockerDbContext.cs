using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using Dockify.Model.Entities;
using System.Threading.Tasks;
using System.Linq;
using System.Threading;
using Docker.Manager.Model.Base.Interfaces;

namespace Docker.Manager.Model.DataContext
{
    public class DockerDbContext : DbContext
    {
        public Guid CurrentUserId { get; set; }

        public DockerDbContext()
        {

        }

        public DockerDbContext(DbContextOptions<DockerDbContext> options) : base(options)
        {

        }

        #region Entities 

        public virtual DbSet<Company> Companies { get; set; }
        public virtual DbSet<CompanyDockerImage> CompanyDockerImages { get; set; }
        public virtual DbSet<DockerAppTemplate> DockerAppTemplates { get; set; }

        public virtual DbSet<DockerRegistry> DockerRegistries { get; set; }

        public virtual DbSet<ShellScript> ShellScripts { get; set; }

        #endregion

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlite("Data Source=dockersettingsdb2020.db");
                //      optionsBuilder.UseSqlServer("Server=(local);Database=DockerSettingsDb2020;user id=sa;password=Tpsy@z09!;MultipleActiveResultSets=true");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<DockerAppTemplate>().Property(p => p.Ports)
                .HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries));

            modelBuilder.Entity<DockerAppTemplate>().Property(p => p.Binds)
                .HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries));
        }

        public override int SaveChanges()
        {
            this.AuditEntities();

            return base.SaveChanges();
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            this.AuditEntities();

            return await base.SaveChangesAsync(cancellationToken);
        }

        private void AuditEntities()
        {
            var now = DateTime.Now;

            foreach (var entry in ChangeTracker.Entries<IAuditableEntity>()
                .Where(p => p.State == EntityState.Added || p.State == EntityState.Deleted || p.State == EntityState.Modified).ToArray())
            {
                var entity = entry.Entity;

                if (entry.State == EntityState.Added)
                {
                    entity.CreatedOn = now;
                    entity.CreatedById = CurrentUserId;
                }
                else if (entry.State == EntityState.Modified)
                {
                    entity.ModifiedOn = now;
                    entity.ModifiedById = CurrentUserId;
                }
            }
        }

    }

}
