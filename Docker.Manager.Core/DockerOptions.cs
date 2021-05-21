using System;
using System.Collections.Generic;
using System.Text;

namespace Docker.Manager.Core
{
    public class DockerOptions
    {
        public string ConnectionType { get; set; }
        public string WindowsAddress { get; set; }
        public string LinuxAddress { get; set; }
        public string RemoteAddress { get; set; }
        public int? PortNo { get; set; }
        public List<RegistryHub> Registries { get; set; }
    }

    public class RegistryHub
    {
        public string UserName { get; set; }
        public string Password { get; set; }
        public bool IsPrivate { get; set; }
        public string ServerAddress { get; set; }
    }
}
