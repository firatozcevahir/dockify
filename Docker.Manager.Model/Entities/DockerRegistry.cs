using Docker.Manager.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Dockify.Model.Entities
{
    public class DockerRegistry : AuditableEntity
    {
        [Column(TypeName = "varchar(500)"), Required]
        public string Name { get; set; }
         
        [Column(TypeName = "varchar(100)"), Required]
        public string RegistryUrl { get; set; }
        public bool AuthenticationRequired { get; set; }

        [Column(TypeName = "varchar(50)")]
        public string UserName { get; set; }

        [Column(TypeName = "varchar(50)")]
        public string Password { get; set; }

        public string PersonalAccessToken { get; set; }
    }
}
