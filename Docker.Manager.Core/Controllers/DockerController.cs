using Docker.DotNet;
using Docker.DotNet.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;

using Docker.Manager.Model.Dto;
using Docker.Manager.Core.Interfaces;
using Docker.Manager.Core.Model;
using Docker.Manager.Model.DockerHubModel;

namespace Docker.Manager.Core.Controllers
{
    [Produces("application/json")]
    [Route("docker")]
    [EnableCors("teknopalasPolicy")]
    public class DockerController
    {
        private readonly IDockerHubService _iDockerHubService;

        public DockerController(
            IDockerHubService iDockerHubService
         )
        {
            _iDockerHubService = iDockerHubService;
        }

        [HttpGet]
        [Route("monitor-events")]
        public DockerHubResponse MonitorEvents()
        {
            return _iDockerHubService.MonitorEvents();
        }


        [HttpGet]
        [Route("system-info")]
        public async Task<DockerHubResponse> GetSystemInformation() => await _iDockerHubService.GetSystemInformationAsync();

        #region  ********* I M A G E S   -   S W A R M     *******************************************************

        [HttpPost]
        [Route("create-swarm")]
        public async Task<DockerHubResponse> GetCreateSwarmAsync([FromBody] CreateSwarmDto model)
        {
            return await _iDockerHubService.InitializeSwarmAsync(model);
        }

        [HttpGet]
        [Route("inspect-swarm")]
        public async Task<DockerHubResponse> GetSwarmListAsync() => await _iDockerHubService.InspectSwarmAsync();

        [HttpPost]
        [Route("join-swarm")]
        public async Task<DockerHubResponse> GetJionSwarmAsync([FromBody] JoinSwarmDto model)
        {
            return await _iDockerHubService.JoinSwarmAsync(model);
        }

        [HttpGet]
        [Route("unlock-swarm/{unlockKey}")]
        public bool GetUnlockSwarm([FromRoute] string unlockKey) => _iDockerHubService.UnlockSwarm(unlockKey);

        [HttpGet]
        [Route("list-swarm-node")]
        public async Task<DockerHubResponse> ListNodeSwarm() => await _iDockerHubService.ListSwarmNode();

        [HttpGet]
        [Route("inspect-swarm-node/{id}")]
        public Task<DockerHubResponse> InspectNodeSwarm(string id) => _iDockerHubService.InspectSwarmNode(id);

        [HttpPost]
        [Route("update-swarm-node")]
        public bool UpdateSwarmNode([FromBody] SwarmNodeDto model)
        {
            try
            {
                var result = _iDockerHubService.UpdateSwarmNode(model);
                return result;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        [HttpGet]
        [Route("remove-swarm-node/{id}")]
        public bool RemoveSwarmNode([FromRoute] string id) => _iDockerHubService.RemoveSwarmNode(id);

        #endregion

        #region  ********* I M A G E S   -   S E R V I C E S     *******************************************************

        [HttpGet]
        [Route("list-service")]
        public async Task<DockerHubResponse> ListServiceSwarm() => await _iDockerHubService.ListSwarmService();

        [HttpGet]
        [Route("inspect-service/{id}")]
        public Task<DockerHubResponse> InspectServiceSwarm(string id) => _iDockerHubService.InspectSwarmService(id);

        [HttpGet]
        [Route("list-service-tasks/{id}")]
        public async Task<DockerHubResponse> ListServiceTasks(string id) => await _iDockerHubService.ListServiceTasks(id);

        [HttpPost]
        [Route("create-service")]  // WIP
        public Task<DockerHubResponse> CreateSwarmService([FromBody] CreateSwarmServiceDto data) => _iDockerHubService.CreateSwarmService(data);

        [HttpPost]
        [Route("update-service-replicas")]
        public async Task<DockerHubResponse> UpdateSwarmServiceReplicas([FromBody] UpdateServiceReplicaDto model) => await _iDockerHubService.UpdateSwarmServiceReplicas(model);

        [HttpGet]
        [Route("remove-service/{id}")]
        public async Task<DockerHubResponse> RemoveSwarmService([FromRoute] string id) => await _iDockerHubService.RemoveSwarmService(id);

        [HttpGet]
        [Route("prune-images")]
        public async Task<DockerHubResponse> PruneImage() => await _iDockerHubService.PruneImageAsync();

        #endregion

        #region  *********  V O L U M E     *****************************************************************

        [HttpPost]
        [Route("create-volume")]
        public async Task<DockerHubResponse> CreateVolumesAsync([FromBody] VolumesCreateParameters model)
        {
            return await _iDockerHubService.CreateVolumesAsync(model);
        }

        [HttpGet]
        [Route("list-volume")]
        public async Task<DockerHubResponse> GetVolumesListAsync()
        {
            return await _iDockerHubService.GetVolumesListAsync();
        }

        [HttpGet]
        [Route("inspect-volume/{name}")]
        public async Task<DockerHubResponse> GetVolumesInspectAsync(string name)
        {
            return await _iDockerHubService.GetVolumesInspectAsync(name);
        }

        [HttpGet]
        [Route("remove-volume/{name}")]
        public async Task<DockerHubResponse> RemoveVolumes(string name)
        {
            return await _iDockerHubService.RemoveVolumes(name);
        }

        [HttpGet]
        [Route("prune-volume")]
        public async Task<DockerHubResponse> PruneVolumes()
        {
            return await _iDockerHubService.PruneVolumes();
        }

        #endregion

        #region  ********* I M A G E S    ******************************************************************

        [HttpGet]
        [Route("list-images")]
        public async Task<DockerHubResponse> GetImageListAsync()
        {
            return await _iDockerHubService.GetImageListAsync();
        }

        [HttpGet]
        [Route("image-history/{id}")]
        public async Task<DockerHubResponse> GetImageHistoryAsync(string id)
        {
            return await _iDockerHubService.GetImageHistoryListAsync(id);
        }

        [HttpGet]
        [Route("image-inspect/{id}")]
        public async Task<DockerHubResponse> GetImageInspectAsync(string id)
        {
            return await _iDockerHubService.GetImageInspectAsync(id);
        }

        [HttpPost]
        [Route("tag-image")]
        public async Task<DockerHubResponse> GetTagImageAsync([FromBody] TagImageDto model)
        {
            return await _iDockerHubService.TagImageAsync(model.Id, model.RepoName, model.Tag, model.fromSrc);
        }

        [HttpPost]
        [Route("create-image-from-image")]
        public async Task<DockerHubResponse> CreateNewImageFromImage([FromBody] CreateImageDto model)
        {
            return await _iDockerHubService.CreateNewImageFromImage(model);
        }

        [HttpGet]
        [Route("create-image-from-dockfile")]
        public async Task<Stream> CreateImageFromDockFile()
        {
            var stream = File.OpenRead("Dockerfile");
            var results = await _iDockerHubService.CreateImageFromDockerFile(stream, "Teknopalas_test_builder", "builder");

            return results;
        }

        [HttpGet]
        [Route("delete-image/{name}")]
        public async Task<DockerHubResponse> DeleteImageByNameAsync([FromRoute] string name)
        {
            return await _iDockerHubService.DeleteImageAsync(name);
        }

        [HttpPost]
        [Route("search-image")]
        public async Task<DockerHubResponse> SearchImageByNameAsync([FromBody] SearchImageDto searchImage)
        {
            return await _iDockerHubService.SearchForImageAsync(searchImage.SearchTerm, searchImage.DockerRegistry);
        }

        [HttpPost]
        [Route("push-image")]
        public async Task<DockerHubResponse> PushImageByIdAsync([FromBody] PushImageDto model)
        => await _iDockerHubService.PushImageAsync(model.RepoName, model.Id, model.Tag, model.FromSrc);

        [HttpPost]
        [Route("commit-container")]
        public async Task<DockerHubResponse> CommitConatinerChangeAsync([FromBody] CreateImageFromContainerDto model)
        {
            return await _iDockerHubService.CommitConatinerChangeAsync(model);
        }

        #endregion

        #region  ******** N E T W O R K   *****************************************************************

        [HttpGet]
        [Route("list-networks")]
        public async Task<DockerHubResponse> GetNetworksListAsync()
        {
            return await _iDockerHubService.GetNetworkListAsync();
        }

        [HttpPost]
        [Route("create-network")]
        public async Task<DockerHubResponse> CreateNetworkAsync([FromBody] CreateNetworkDto model)
        => await _iDockerHubService.CreateNetworkAsync(model.Name, model.CheckDuplicate, model.EnableIPv6);

        [HttpGet]
        [Route("delete-network/{id}")]
        public async Task<DockerHubResponse> DeleteNetworkAsync(string id)
        {
            return await _iDockerHubService.DeleteNetworkAsync(id);
        }
        [HttpGet]
        [Route("network-inspect/{id}")]
        public async Task<DockerHubResponse> InspectNetworkAsync(string id)
        {
            return await _iDockerHubService.InspectNetworkAsync(id);
        }

        [HttpGet]
        [Route("connect-network/{networkId}/{containerId}")]
        public async Task<DockerHubResponse> ConnectNetworkAsync(string networkId, string containerId)
        {
            return await _iDockerHubService.ConnectNetworkAsync(networkId, containerId);
        }

        [HttpGet]
        [Route("disconnect-network/{networkId}/{containerId}")]
        public async Task<DockerHubResponse> DisconnectNetworkAsync(string networkId, string containerId)
        {
            return await _iDockerHubService.DisconnectNetworkAsync(networkId, containerId);
        }

        [HttpGet]
        [Route("prune-network")]
        public async Task<DockerHubResponse> PruneNetwork() => await _iDockerHubService.PruneNetworkAsync();

        #endregion

        #region  ****** C O N T A I N E R S  **************************************************************

        [HttpPost]
        [Route("create-container")]
        public async Task<DockerHubResponse> CreateContainerAsync([FromBody] ContainerModel data)
        {
            return await _iDockerHubService.CreateContainerAsync(data);
        }

        [HttpGet]
        [Route("list-containers")]
        public async Task<DockerHubResponse> GetContainersListAsync()
        {
            return await _iDockerHubService.GetContainersListAsync();
        }

        [HttpGet]
        [Route("container-inspect/{id}")]
        public async Task<DockerHubResponse> GetContainerInspectAsync(string id)
        {
            return await _iDockerHubService.InspectContainerAsync(id);
        }

        [HttpGet]
        [Route("stop-container/{id}")]
        public async Task<DockerHubResponse> GetStopContainer([FromRoute] string id)
        {
            return await _iDockerHubService.StopContainerAsync(id);
        }

        [HttpGet]
        [Route("start-container/{id}")]
        public async Task<DockerHubResponse> GetStartContainer([FromRoute] string id)
        {
            return await _iDockerHubService.StartContainerAsync(id);
        }

        [HttpGet]
        [Route("restart-container/{id}")]
        public async Task<DockerHubResponse> GetRestartContainer([FromRoute] string id)
        {
            return await _iDockerHubService.RestartContainerAsync(id);
        }

        [HttpGet]
        [Route("pause-container/{id}")]
        public async Task<DockerHubResponse> GetPauseContainer([FromRoute] string id)
        {
            return await _iDockerHubService.PauseContainerAsync(id);
        }

        [HttpGet]
        [Route("unpause-container/{id}")]
        public async Task<DockerHubResponse> GetUnPauseContainer([FromRoute] string id)
        {
            return await _iDockerHubService.UnPauseContainerAsync(id);
        }

        [HttpGet]
        [Route("rename-container/{id}/{newName}")]
        public async Task<DockerHubResponse> RenameContainerAsync([FromRoute] string id, string newName)
        {
            return await _iDockerHubService.RenameContainerAsync(id, newName);
        }

        [HttpGet]
        [Route("delete-container/{id}")]
        public async Task<DockerHubResponse> DeleteContainer([FromRoute] string id)
        {
            return await _iDockerHubService.DeleteContainerAsync(id);
        }

        [HttpGet]
        [Route("get-container-stats/{id}")]
        public async Task<DockerHubResponse> GetContainerStats(string id)
        {
            return await _iDockerHubService.GetContainerStats(id);
        }

        [HttpGet]
        [Route("get-container-logs/{id}")]
        public async Task<DockerHubResponse> GetContainerLogs(string id)
        {
            return await _iDockerHubService.GetContainerLogs(id);
        }

        [HttpGet]
        [Route("prune-container/{pruneProtected}")]
        public async Task<DockerHubResponse> PruneContainer([FromRoute] bool pruneProtected) => await _iDockerHubService.PruneContainerAsync(pruneProtected);

        [HttpGet]
        [Route("exec-create/{id}/{user}/{*cmd}")]
        public async Task<DockerHubResponse> ExecCreateContainerAsync([FromRoute] string id, string user, string cmd)
        {
            return await _iDockerHubService.ExecCreateContainerAsync(id, cmd, user);
        }

        [HttpGet]
        [Route("exec-start/{containerid}/{cmd}")]
        public async Task<DockerHubResponse> ExecStartAsync([FromRoute] string containerid, string cmd)
        {
            return await _iDockerHubService.ExecStart(containerid, cmd);
        }
        #endregion

    }
}
