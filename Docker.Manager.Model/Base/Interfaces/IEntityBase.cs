using System;

namespace Docker.Manager.Model.Base.Interfaces
{
    public interface IEntityBase
    {
        Guid Id { get; set; }
    }
}