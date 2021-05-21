using System;
using System.Collections.Generic;
using System.Text;

namespace Docker.Manager.Model.DockerHubModel
{
    public enum DockerHubResponseType
    {
        DockerApiExceptionResponse,
        CreateContainerResponse,
        ContainerListResponse,
        ContainerInspectResponse,
        ImageHistoryResponse,
        InspectImageResponse,
        InspectNetworkResponse,
        InspectVolumeResponse,
        InspectNodeResponse,
        OperationSuccessfulResponse,
        StartContainerResponse,
        StopContainerResponse,
        DeleteContainerResponse,
        DeleteImageResponse,
        DeleteNetworkResponse,
        ConnectNetworkResponse,
        DisconnectNetworkResponse,
        TagImageResponse,
        CreateImageFromImageResponse,
        PushImageResponse,
        SearchForImageResponse,
        ImageListResponse,
        RenameContainerResponse,
        CreateVolumeResponse,
        DeleteVolumeResponse,
        VolumeListResponse,
        PruneVolumeResponse,
        NetworkListResponse,
        CreateNetworkResponse,
        SystemInfoResponse,
        SwarmService,
        ServiceCreateResponse,
        InspectServiceResponse,
        CreateSwarmServiceResponse,
        DeleteSwarmServiceResponse,
        UpdateSwarmServiceReplicasResponse,
        InitSwarmResponse,
        InspectSwarmResponse,
        ListNodesResponse,
        JoinSwarmResponse,
        ImagesPruneResponse,
        ContainersPruneResponse,
        NetworksPruneResponse,
        PauseContainerResponse,
        UnPauseContainerResponse,
        ListRegistryCatalogs,
        ListRegistryCatalogTags,
        RestartContainerResponse
    }
}
