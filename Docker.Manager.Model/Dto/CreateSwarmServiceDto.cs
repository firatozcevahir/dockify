
using System.Collections.Generic;

namespace Docker.Manager.Model.Dto
{
    public class CreateSwarmServiceDto
    {
        public string Name { get; set; }
        public DockerRegistryDto FromSrc { get; set; }
        public CompanyDto Company { get; set; }
        public string Image { get; set; }
        public IList<string> Ports { get; set; }
        public int? Replicated { get; set; }
        public string WorkingDir { get; set; }
        public string Cmd { get; set; }
        public string Args { get; set; }
        public string Env { get; set; } // raw environment string
        public List<string> Binds { get; set; }
        public bool TTY { get; set; }
        public long MemoryReservation { get; set; }
        public long Memory { get; set; }
        public long NanoCpusReservation { get; set; }
        public long NanoCpus { get; set; }
        public ulong UpdateParallelism { get; set; }

        public long UpdateDelay { get; set; }
        public string UpdateFailureAction { get; set; }
        public string UpdateOrder { get; set; }        
        public string RestartCondition { get; set; }
        public long RestartDelay { get; set; }
        public ulong? RestartMaxAttempts { get; set; }
        public long RestartWindow { get; set; }
    }
}
