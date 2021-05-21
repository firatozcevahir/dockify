using System;
using System.Collections.Generic;
using System.Text;

namespace Docker.Manager.Model.Dto
{
    public class JoinSwarmDto
    {
        public string ListenAddr { get; set; }
        public string AdvertiseAddr { get; set; }
        public string DataPathAddr { get; set; }
        public IList<string> RemoteAddrs { get; set; }
        public string JoinToken { get; set; }
    }
}
