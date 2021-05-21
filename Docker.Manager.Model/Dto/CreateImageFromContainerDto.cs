
using System.Collections.Generic;

namespace Docker.Manager.Model.Dto
{
    public class CreateImageFromContainerDto
    {
        public string Comment { get; set; }
        public string ContainerID { get; set; }
        public string RepositoryName { get; set; }
        public string Tag { get; set; }
        public bool Pause { get; set; }
        public CreateImageFromContainerConfig Config { get; set; }
    }

    public class CreateImageFromContainerConfig
    {
        public string ImageName { get; set; }
        public string Hostname { get; set; }
        public string Domainname { get; set; }
        public string ExposedPorts { get; set; }
        public string Volumes { get; set; }
        public List<string> Env { get; set; }

        public List<string> Cmd { get; set; }
    }
}
