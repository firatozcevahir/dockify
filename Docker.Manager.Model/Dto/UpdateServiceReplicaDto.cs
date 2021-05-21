using Docker.DotNet.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Docker.Manager.Model.Dto
{
    public class UpdateServiceReplicaDto
    {
        public string Id { get; set; }
        public ulong Replicas { get; set; }
    }
}
