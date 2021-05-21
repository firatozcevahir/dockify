using System;
using System.ComponentModel.DataAnnotations.Schema;
using Docker.Manager.Model.Base.Interfaces; 

namespace Docker.Manager.Model.Base
{
    public class AuditableEntity : EntityBase, IAuditableEntity
    {
        [Column(Order = 1000, TypeName = "datetime")]
        public DateTime CreatedOn { get; set; }

        [Column(Order = 1001, TypeName = "datetime")]
        public DateTime? ModifiedOn { get; set; }

        [Column(Order = 1002)]
        public Guid CreatedById { get; set; }

        [Column(Order = 1003)]
        public Guid? ModifiedById { get; set; }
    }
}