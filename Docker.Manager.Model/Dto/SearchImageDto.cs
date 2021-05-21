using System;
using System.Collections.Generic;
using System.Text;

namespace Docker.Manager.Model.Dto
{
    public class SearchImageDto
    {
        public string SearchTerm { get; set; }
        public DockerRegistryDto DockerRegistry { get; set; }
    }
}
