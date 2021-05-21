using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using Docker.Manager.Model.Base;

namespace Dockify.Model.Entities
{
    public class DockerAppTemplate : AuditableEntity
    {

        [Column(TypeName = "varchar(100)"), Required]
        public string TemplateTitle { get; set; }

        [Column(TypeName = "varchar(200)"), Required]
        public string Description { get; set; }
        public string LogoURL { get; set; }
        public bool PublishAllPorts { get; set; }
        public IList<string> Ports { get; set; }
        public IList<string> Binds { get; set; }
        public string Cmd { get; set; }
        public string EntryPoint { get; set; }
        public bool StartContainer { get; set; } 
        public bool AutoUpdate { get; set; }
        public string Env { get; set; }
        public byte? Platform { get; set; }
        public bool AlwaysPullImage { get; set; }
        public bool IsProtected { get; set; }
    }

    public enum Platform : byte
    {
        Multiple = 1,
        Windows = 2,
        Linux = 3
    }

    public enum RestartPolicy : byte
    {
        Always = 1,
        Unless_Stopped = 2,
        On_Failure = 3,
        None = 4
    }
}
