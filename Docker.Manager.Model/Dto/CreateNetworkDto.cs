using System;
using System.Collections.Generic;
using System.Text;

namespace Docker.Manager.Model.Dto
{
    public class CreateNetworkDto
    {
        public string Name { get; set; }
        public bool CheckDuplicate { get; set; }
        public bool EnableIPv6 { get; set; }
    }
}
