using System;
using System.Collections.Generic;
using System.Text;

namespace Docker.Manager.Model.Dto
{
    public class CreateImageDto
    { 
        public string FromImage { get; set; }
        public DockerRegistryDto FromSrc { get; set; }
    }

}
