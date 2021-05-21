using System;
using System.Collections.Generic;
using System.Text;

namespace Docker.Manager.Model.Dto
{
    public class AppTemplateDto
    {
        public Guid Id { get; set; }
        public string TemplateTitle { get; set; }
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
        public DateTime CreatedOn { get; set; }
        public bool AlwaysPullImage { get; set; }
        public bool IsProtected { get; set; }
    }

    public class ImageTemplateSearchDto
    {
        public string TemplateTitle { get; set; } = null;
        public string Description { get; set; }
        public byte? Platform { get; set; }

        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 1000;
    }
}
