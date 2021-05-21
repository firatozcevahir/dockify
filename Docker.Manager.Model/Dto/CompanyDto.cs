using Docker.Manager.Model.Base;
using System;
using System.Collections.Generic;
using System.Text;

namespace Docker.Manager.Model.Dto
{
    public class CompanyDto: CompanySearchDto
    {
        public Guid Id { get; set; }
        public string Address { get; set; }
        public string EmailAddress { get; set; }
        public string HostName { get; set; }
        public string DataBase { get; set; }
        public string DomainName { get; set; }
        public string Environment { get; set; }

        public DateTime CreatedOn { get; set; }
        public RecordState RecordState{ get; set; }
    }

    public class CompanySearchDto
    {
        public string Name { get; set; } = null;
        public string DnsName { get; set; } = null;
        public string TelephoneNo { get; set; } = null;

        public string ContactPerson { get; set; } = null;

        public int PageIndex { get; set; } = 0;
        public int PageSize { get; set; } = 1000;
    }

}
