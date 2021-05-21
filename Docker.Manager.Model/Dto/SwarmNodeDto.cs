using System;
using System.Collections.Generic;
using System.Text;

namespace Docker.Manager.Model.Dto
{
    public class SwarmNodeDto
    {
        public string Id { get; set; }
        public int Version { get; set; }
        public string Name { get; set; }
        public string Availability { get; set; }
        public string Role { get; set; }

    }
}
