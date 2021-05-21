using System;

namespace Docker.Manager.Model.Base.Interfaces
{
    public interface IAuditableEntity
    {
        DateTime CreatedOn { get; set; }

        DateTime? ModifiedOn { get; set; }

        Guid CreatedById { get; set; }

        Guid? ModifiedById { get; set; }
    }
}