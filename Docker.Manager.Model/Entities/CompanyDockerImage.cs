using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using Docker.Manager.Model.Base;

namespace Dockify.Model.Entities
{
    public class CompanyDockerImage : AuditableEntity
    {
        public Guid? DockerId { get; set; }
        [ForeignKey(nameof(DockerId))]
        public virtual DockerAppTemplate DockerImages { get; set; }

        public Guid? CompanyId { get; set; }
        [ForeignKey(nameof(CompanyId))]
        public virtual Company Companies { get; set; }
    }
}
