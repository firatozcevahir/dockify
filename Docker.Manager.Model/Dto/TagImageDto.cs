using System;
using System.Collections.Generic;
using System.Text;

namespace Docker.Manager.Model.Dto
{
    public class TagImageDto
    {
        public string Id { get; set; }
        public string RepoName { get; set; }
        public string Tag { get; set; }

        public DockerRegistryDto fromSrc { get; set; }
    }
}
