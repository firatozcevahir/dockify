using System;
using System.Collections.Generic;
using System.Text;

namespace Docker.Manager.Model.Dto
{
    public class CreateSwarmDto
    {
        // public string Name { get; set; }
        public string ListenAddr { get; set; }
        public string AdvertiseAddr { get; set; }
        public string DataPathAddr { get; set; }
        public uint DataPathPort { get; set; }
        public bool ForceNewCluster { get; set; }
        public bool AutoLockManagers { get; set; }
        public string Availability { get; set; }
        public IList<string> DefaultAddrPool { get; set; }
        public int SubnetSize { get; set; }
        public int TaskHistoryRetentionLimit { get; set; }
        public int HeartbeatPeriod { get; set; }
        
    }
}
