using Docker.DotNet.Models;
using Docker.Manager.Core.Model;
using Docker.Manager.Model.DockerHubModel;
using Docker.Manager.Model.Dto;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace Docker.Manager.Core.Interfaces
{
    public interface IDockerHubService
    {
        Task<DockerHubResponse> GetSystemInformationAsync();
        DockerHubResponse MonitorEvents();

        #region All About Docker Images-Swarm

        Task<DockerHubResponse> InspectSwarmAsync();

        Task<DockerHubResponse> InitializeSwarmAsync(CreateSwarmDto model);
        Task<DockerHubResponse> JoinSwarmAsync(JoinSwarmDto model);
        bool UnlockSwarm(string unlockKey);

        Task<DockerHubResponse> ListSwarmNode();
        Task<DockerHubResponse> InspectSwarmNode(string id);
        bool UpdateSwarmNode(SwarmNodeDto model);
        bool RemoveSwarmNode(string id);

        #endregion

        #region All About Docker Services

        Task<DockerHubResponse> ListSwarmService();
        Task<DockerHubResponse> InspectSwarmService(string id);
        Task<DockerHubResponse> ListServiceTasks(string id);
        Task<DockerHubResponse> CreateSwarmService(CreateSwarmServiceDto data);
        Task<DockerHubResponse> RemoveSwarmService(string id);

        Task<DockerHubResponse> UpdateSwarmServiceReplicas(UpdateServiceReplicaDto model);

        #endregion

        #region All About Docker Volumes

        Task<DockerHubResponse> PruneVolumes();
        Task<DockerHubResponse> GetVolumesListAsync();
        Task<DockerHubResponse> GetVolumesInspectAsync(string name);
        Task<DockerHubResponse> CreateVolumesAsync(VolumesCreateParameters model);
        Task<DockerHubResponse> RemoveVolumes(string name);

        #endregion

        #region All About Docker Images

        Task<DockerHubResponse> GetImageListAsync();
        Task<DockerHubResponse> GetImageHistoryListAsync(string id);
        Task<DockerHubResponse> TagImageAsync(string id, string repositoryName, string tag, DockerRegistryDto fromSrc);
        Task<DockerHubResponse> GetImageInspectAsync(string id);

        // bool CreateNewImageFromImage(string fromImage, string repo, string tag, string fromSrc);

        Task<DockerHubResponse> PruneImageAsync();

        Task<DockerHubResponse> CreateNewImageFromImage(CreateImageDto model);

        Task<Stream> CreateImageFromDockerFile(Stream stream, string dockerFile, string image);
        Task<DockerHubResponse> PushImageAsync(string repoName, string imageId, string tag, DockerRegistryDto dockerRegistry);
        Task<DockerHubResponse> SearchForImageAsync(string searchTerms, DockerRegistryDto dockerRegistry);
        
        Task<DockerHubResponse> CommitConatinerChangeAsync(CreateImageFromContainerDto model);
        Task<DockerHubResponse> DeleteImageAsync(string name);

        #endregion

        #region All About Docker Network

        Task<DockerHubResponse> GetNetworkListAsync();
        Task<DockerHubResponse> CreateNetworkAsync(string name, bool checkDuplicate, bool enableIPv6);
        Task<DockerHubResponse> InspectNetworkAsync(string id);
        Task<DockerHubResponse> DeleteNetworkAsync(string id);
        Task<DockerHubResponse> ConnectNetworkAsync(string networkId, string containerId);
        Task<DockerHubResponse> DisconnectNetworkAsync(string networkId, string containerId);
        Task<DockerHubResponse> PruneNetworkAsync();

        #endregion

        #region All About Docker Containers
        Task<DockerHubResponse> CreateContainerAsync(ContainerModel data);
        Task<DockerHubResponse> GetContainersListAsync();
        Task<DockerHubResponse> RenameContainerAsync(string id, string newName);
        Task<DockerHubResponse> InspectContainerAsync(string id);
        Task<DockerHubResponse> StartContainerAsync(string id);
        Task<DockerHubResponse> RestartContainerAsync(string id);

        Task<DockerHubResponse> PauseContainerAsync(string id);
        Task<DockerHubResponse> UnPauseContainerAsync(string id);
        Task<DockerHubResponse> StopContainerAsync(string id);
        Task<DockerHubResponse> DeleteContainerAsync(string id);
        Task<DockerHubResponse> GetContainerStats(string id);
        Task<DockerHubResponse> GetContainerLogs(string id);
        Task<DockerHubResponse> PruneContainerAsync(bool pruneProtected);
        Task<DockerHubResponse> ExecCreateContainerAsync(string id, string cmd, string user);
        Task<DockerHubResponse> ExecStart(string containerid, string cmd);

        #endregion

    }

}
