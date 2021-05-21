using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using Docker.Manager.Model.Base;

namespace Dockify.Model.Entities
{
    public class Company : AuditableEntity
    {
        public Company()
        {
            CompanyDockerImages = new HashSet<CompanyDockerImage>();
        }

        [Column(TypeName = "varchar(500)")]
        public string Name { get; set; }

        [Column(TypeName = "varchar(30)")]
        public string ShortName { get; set; }

        [Column(TypeName = "varchar(200)")]
        public string DnsName { get; set; }

        [Column(TypeName = "varchar(200)")]
        public string DomainName { get; set; }

        public string DataBase { get; set; }

        [Column(TypeName = "varchar(200)")]
        public string HostName { get; set; }

        public string Environment { get; set; }

        [Column(TypeName = "varchar(500)")]
        public string Address { get; set; }

        [Column(TypeName = "varchar(20)")]
        public string TelephoneNo { get; set; }

        [Column(TypeName = "varchar(500)")]
        public string EmailAddress { get; set; }

        [Column(TypeName = "varchar(50)")]
        public string ContactPerson { get; set; }

        public virtual ICollection<CompanyDockerImage> CompanyDockerImages { get; set; }

    }
}
