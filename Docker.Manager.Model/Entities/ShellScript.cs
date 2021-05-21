using Docker.Manager.Model.Base;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Dockify.Model.Entities
{
    public class ShellScript: AuditableEntity
    {
        [Column(TypeName = "varchar(100)"), Required]
        public string Name { get; set; }

        [Required]
        public string Content { get; set; }
        public string Path { get; set; }
        public string FullPath { get; set; }
        public string FileName { get; set; }


    }
}
