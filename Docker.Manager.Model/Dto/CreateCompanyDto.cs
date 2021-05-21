using System;
using System.Collections.Generic;
using System.Text;

namespace Docker.Manager.Model.Dto
{
    public class CreateCompanyDto
    {
        public string Name { get; set; }
        public string ShortName { get; set; }
        public string DnsName { get; set; }
        public string DomainName { get; set; }
        public string DataBase { get; set; }
        public string HostName { get; set; }
        public string Address { get; set; }
        public string TelephoneNo { get; set; }
        public string EmailAddress { get; set; }
        public string ContactPerson { get; set; }
        public string Environment { get; set; }
        // public List<string> Env { get; set; }
    }
}
