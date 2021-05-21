
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Docker.Manager.Model.Base.Interfaces;

namespace Docker.Manager.Model.Base
{
    public class EntityBase : IEntityBase
    {
        public RecordState RecordState { get; set; } = RecordState.Active;

        [Key]
        public Guid Id { get; set; }
    }

    public enum RecordState : byte
    {
        Pending = 0,

        Active = 1,

        Passive = 2,

        Deleted = 3,

        Cancel = 4,

        Lock = 5,

        Closed = 6

    }
}