using System;
using System.Collections.Generic;
using System.Text;
using Docker.Manager.Core.Model;
using Docker.DotNet;
using Newtonsoft.Json;
using Docker.Manager.Model.DockerHubModel;

namespace Docker.Manager.Core.Helpers
{
    //public static class Helper
    //{
    //    public static string RegistryUrlWorker(string url)
    //    {
    //        if (url.Contains("http://")) url = url.Replace("http://", "");
    //        if (url.Contains("https://")) url = url.Replace("https://", "");
    //        return url;
    //    }

    //    /// <summary>
    //    ///  Generates DockerHubResponse object with given exception
    //    /// </summary>
    //    /// <param name="ex">api exception</param>
    //    /// <returns>A new instance of DockerHubResponse</returns>
    //    public static DockerHubResponse GetDockerHubResponse(DockerApiException ex)
    //    {
    //        return new DockerHubResponse
    //        {
    //            Success = false,
    //            Type = DockerHubResponseType.DockerApiExceptionResponse,
    //            Result = SerialErrorMessage(ex)
    //        };
    //    }

    //    public static string SerialErrorMessage(DockerApiException ex)
    //    {
    //        return JsonConvert.DeserializeObject<DockerApiExceptionMessage>(ex.ResponseBody).Message;
    //    }
    //}
}
