
using Docker.Manager.Model.Dto;
using System.Collections.Generic;

namespace Docker.Manager.Core.Model
{
    public class ContainerModel
    {
        public string Image { get; set; }
        public bool AlwaysPullImage { get; set; }
        public DockerRegistryDto FromSrc { get; set; }
        public CompanyDto Company { get; set; }
        public bool ArgsEscaped { get; set; }
        public string Domainname { get; set; }
        public string Hostname { get; set; }
        public string Name { get; set; }
        public List<string> DnsName { get; set; }
        public bool Tty { get; set; }
        public IList<string> Ports { get; set; }
        public string MacAddress { get; set; }
        public bool NetworkDisabled { get; set; }
        public string WorkingDir { get; set; }
        public string StoragePath { get; set; }
        public string RestartPolicy { get; set; }
        public string Cmd { get; set; }
        public string EntryPoint { get; set; }
        public string Env { get; set; } // raw environment string
        public List<string> Binds { get; set; }
        public List<string> Links { get; set; }

        public long Memory { get; set; }
        public long MemoryReservation { get; set; }
        public float NanoCPUs { get; set; }
        public string NetworkMode { get; set; }
        public string MyVolumes { get; set; }

        public bool StartContainer { get; set; }
        public bool IsProtected { get; set; }
        public bool PublishAllPorts { get; set; }
        public bool Privileged { get; set; }
        public bool ReadonlyRootfs { get; set; }
        public bool AutoRemove { get; set; }

        public bool AutoUpdate { get; set; }

    }

}
