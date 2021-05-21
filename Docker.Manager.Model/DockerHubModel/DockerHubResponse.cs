using System;
using System.Collections.Generic;
using System.Text;

namespace Docker.Manager.Model.DockerHubModel
{
    public class DockerHubResponse
    {
        public bool Success { get; set; }
        public object Result { get; set; }

        public DockerHubResponseType Type { get; set; }
    }

    public class DockerApiExceptionMessage
    {
        public string Message { get; set; }
    }
}
