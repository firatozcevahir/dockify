using System;
using System.Collections.Generic;
using System.Text;

namespace Docker.Manager.Model.Dto
{
    public class DockerRegistryDto
    {
        public string Name { get; set; }
        public string RegistryUrl { get; set; }
        public bool AuthenticationRequired { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string PersonalAccessToken { get; set; }
    }
}
