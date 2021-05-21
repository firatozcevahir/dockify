using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Docker.Manager.Core.Helpers;
using Docker.DotNet;
using Docker.DotNet.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Docker.Manager.Core.Interfaces;
using Docker.Manager.Core.Model;
using Microsoft.AspNetCore.SignalR;
using Docker.Manager.Core.Hubs;
using System.Linq;
using Docker.Manager.Model.Dto;
using Docker.Manager.Model.DockerHubModel;
using Docker.Manager.Model.Helpers;
using badisCore.Common;
using Message = Docker.DotNet.Models.Message;
using System.Text;

namespace Docker.Manager.Core.Services
{

    public class DockerHubService : IDockerHubService
    {
        private readonly ILogger<DockerHubService> _logger;
        private DockerClient _client;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly IHubContext<ProgressHub> _progressHub;

        private string _containerStatId;
        private static List<string> _containerStatIds = new List<string>();

        private Progress<JSONMessage> _imageProgress;

        private readonly DockerOptions _dockerOptions;

        private string _execUser = "root";
        private string _execRootCmd = "/bin/bash";

        public DockerHubService(
            ILogger<DockerHubService> logger,
            IServiceScopeFactory serviceScopeFactory,
            IHubContext<ProgressHub> progressHub)
        {
            _logger = logger;
            _progressHub = progressHub;
            _serviceScopeFactory = serviceScopeFactory;
            using var scope = _serviceScopeFactory.CreateScope();
            var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

            _dockerOptions = configuration.GetOptions<DockerOptions>("dockerManager");
            switch (_dockerOptions.ConnectionType)
            {
                case nameof(OsTypes.linux):
                    _client = new DockerClientConfiguration(new Uri(_dockerOptions.LinuxAddress)).CreateClient();
                    break;

                case nameof(OsTypes.windows):
                    _client = new DockerClientConfiguration(new Uri(_dockerOptions.WindowsAddress)).CreateClient();
                    break;

                case nameof(OsTypes.remote):
                    _client = new DockerClientConfiguration(new Uri(_dockerOptions.WindowsAddress)).CreateClient();
                    break;

                default:
                    break;
            }
        }
        public DockerHubResponse MonitorEvents()
        {
            try
            {
                var progress = new Progress<Message>();
                progress.ProgressChanged += MonitorEventProgressChanged;
                _client.System.MonitorEventsAsync(new ContainerEventsParameters(), progress, CancellationToken.None);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return Helper.GetDockerHubResponse(ex);
            }
        }

        private void MonitorEventProgressChanged(object sender, DotNet.Models.Message e)
        {
            // TODO: HANDLE EVENT Message
        }

        private AuthConfig CreateAuthConfig(DockerRegistryDto dockerRegistry)
        {
            if (!dockerRegistry.AuthenticationRequired)
            {
                return new AuthConfig
                {
                    ServerAddress = dockerRegistry.RegistryUrl
                };
            }

            return new AuthConfig
            {
                ServerAddress = dockerRegistry.RegistryUrl,
                Username = dockerRegistry.UserName,
                Password = dockerRegistry.Password
            };
        }

        public async Task<DockerHubResponse> GetSystemInformationAsync()
        {
            try
            {
                var result = await _client.System.GetSystemInfoAsync();
                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.SystemInfoResponse,
                    Result = result
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(ex.Message);
                return Helper.GetDockerHubResponse(ex);
            }
        }

        #region All About Docker Swarm

        public async Task<DockerHubResponse> InitializeSwarmAsync(CreateSwarmDto model)
        {
            // var stream = await _client.Exec.StartAndAttachContainerExecAsync("", true);
            try
            {
                var result = await _client.Swarm.InitSwarmAsync(
                    new SwarmInitParameters()
                    {
                        AdvertiseAddr = model.AdvertiseAddr,
                        Availability = model.Availability,
                        DefaultAddrPool = model.DefaultAddrPool,
                        ListenAddr = model.ListenAddr,
                        SubnetSize = (uint)model.SubnetSize,
                        ForceNewCluster = model.ForceNewCluster,
                        DataPathPort = model.DataPathPort,
                        DataPathAddr = model.DataPathAddr,
                        AutoLockManagers = model.AutoLockManagers,
                        Spec = new Spec
                        {
                            Labels = new Dictionary<string, string>
                             {
                                 { "ENV", "Node1" }
                             },
                            Dispatcher = new DispatcherConfig
                            {
                                HeartbeatPeriod = model.HeartbeatPeriod
                            },
                            Orchestration = new OrchestrationConfig
                            {
                                TaskHistoryRetentionLimit = model.TaskHistoryRetentionLimit
                            },
                            EncryptionConfig = new EncryptionConfig { AutoLockManagers = model.AutoLockManagers }
                        }
                    },
                    default);

                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.InitSwarmResponse,
                    Result = result
                };

            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> InspectSwarmAsync()
        {
            try
            {
                var result = await _client.Swarm.InspectSwarmAsync(cancellationToken: default);
                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.InspectSwarmResponse,
                    Result = result
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> JoinSwarmAsync(JoinSwarmDto model)
        {
            try
            {
                await _client.Swarm.JoinSwarmAsync(
                     new SwarmJoinParameters()
                     {
                         AdvertiseAddr = model.AdvertiseAddr,
                         RemoteAddrs = model.RemoteAddrs,
                         ListenAddr = model.ListenAddr,
                         DataPathAddr = model.DataPathAddr,
                         JoinToken = model.JoinToken,
                     },
                    default);

                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.JoinSwarmResponse,
                    Result = true
                };

            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public bool UnlockSwarm(string unlockKey)
        {
            try
            {
                Task getImageTask = _client.Swarm.UnlockSwarmAsync(
                    new SwarmUnlockParameters()
                    {
                        UnlockKey = unlockKey
                    },
                   default);

                getImageTask.Wait();

                return true;

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return false;
            }
        }

        public async Task<DockerHubResponse> ListSwarmNode()
        {
            try
            {
                var result = await _client.Swarm.ListNodesAsync(default);
                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.ListNodesResponse,
                    Result = result
                };

            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> InspectSwarmNode(string id)
        {
            try
            {
                var result = await _client.Swarm.InspectNodeAsync(id, default);
                return new DockerHubResponse
                {
                    Result = result,
                    Success = true,
                    Type = DockerHubResponseType.InspectNodeResponse
                };

            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public bool UpdateSwarmNode(SwarmNodeDto model)
        {
            try
            {
                Task getImageTask = _client.Swarm.UpdateNodeAsync(model.Id, (ulong)model.Version,
                    new NodeUpdateParameters
                    {
                        Name = model.Name,
                        Availability = model.Availability,
                        Role = model.Role
                    },
                    default);

                getImageTask.Wait();

                return true;

            }
            catch (Exception ex)
            {
                _logger.LogError("Updae-Swarm-Node", $"Error: {ex.Message}");
                return false;
            }
        }

        public bool RemoveSwarmNode(string id)
        {
            try
            {
                Task getImageTask = _client.Swarm.RemoveNodeAsync(id, true, default);

                getImageTask.Wait();

                return true;

            }
            catch (Exception ex)
            {
                _logger.LogError("Remove-Swarm-Node", $"Error: {ex.Message}");
                return false;
            }
        }

        #endregion

        #region All About Docker Services

        public async Task<DockerHubResponse> ListSwarmService()
        {
            try
            {
                var services = await _client.Swarm.ListServicesAsync(new ServicesListParameters { }, default);
                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.SwarmService,
                    Result = services
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> ListServiceTasks(string id)
        {
            try
            {
                var tasks = await _client.Tasks.ListAsync(new TasksListParameters
                {
                    Filters = new Dictionary<string, IDictionary<string, bool>>
                        {
                            { "service", new Dictionary<string, bool> { { id, true } } },
                            //{
                            //    "desired-state",
                            //    new dictionary<string, bool>
                            //    {
                            //        // {"running | preparing | accepted | starting", true}
                            //        {"running", true},
                            //        {"preparing", true},
                            //        {"accepted", true},
                            //        {"starting", true},
                            //        {"stopped", true}
                            //    }
                            //}
                        }
                }, default);


                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.SwarmService,
                    Result = tasks
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> InspectSwarmService(string id)
        {
            try
            {
                var result = await _client.Swarm.InspectServiceAsync(id, default);


                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.DockerApiExceptionResponse,
                    Result = result
                };

            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }

        }
        private IList<PortConfig> HandleServicePorts(IList<string> ports)
        {
            if (ports == null)
            {
                return null;
            }
            var portConfigs = new List<PortConfig>();
            foreach (var port in ports)
            {
                if (!port.Contains(':'))
                {
                    continue;
                }

                var portArray = port.Split(':');

                var publishedPort = portArray[0];
                var targetPort = portArray[1];

                portConfigs.Add(new PortConfig
                {
                    Name = "HTTP",
                    Protocol =
                    targetPort.Contains('/') ? !string.IsNullOrEmpty(targetPort.Split('/')[1]) ? targetPort.Split('/')[1] : "tcp" : "tcp",

                    TargetPort = Convert.ToUInt32(targetPort.Split('/')[0]),
                    PublishedPort = Convert.ToUInt32(publishedPort),
                    PublishMode = "ingress"
                });
            }

            return portConfigs;
        }
        private IList<Mount> HandleServiceMounts(IList<string> binds)
        {
            if (binds is null)
            {
                return null;
            }

            var mounts = new List<Mount>();

            foreach (var bind in binds)
            {
                if (!bind.Contains(':'))
                {
                    continue;
                }
                var bindSplitted = bind.Split(':');
                mounts.Add(new Mount
                {
                    Source = bindSplitted[0],
                    Target = bindSplitted[1],
                    Type = bindSplitted[0].Contains('/') ? "bind" : "volume",
                    ReadOnly = bindSplitted[1].Contains(":ro")
                });
            }

            return mounts;
        }

        public async Task<DockerHubResponse> CreateSwarmService(CreateSwarmServiceDto data) //WIP
        {
            try
            {
                if (data is null)
                {
                    return new DockerHubResponse
                    {
                        Success = false,
                        Type = DockerHubResponseType.DockerApiExceptionResponse,
                        Result = "error"
                    };
                }

                var result = await _client.Swarm.CreateServiceAsync(
                    new ServiceCreateParameters
                    {
                        Service = new ServiceSpec()
                        {

                            Mode = new ServiceMode
                            {
                                Replicated = new ReplicatedService { Replicas = data.Replicated > 0 ? (ulong?)data.Replicated : 1 }
                            },

                            TaskTemplate = new TaskSpec
                            {
                                ContainerSpec = new ContainerSpec()
                                {
                                    Image = $"{Helper.RegistryUrlWorker(data.FromSrc.RegistryUrl)}/{data.Image}",
                                    Command = data.Cmd?.Split(' ', StringSplitOptions.RemoveEmptyEntries).ToList(),
                                    Env = data.Env?.Split('\n', StringSplitOptions.RemoveEmptyEntries).ToList(),
                                    Args = data.Args?.Split(' ', StringSplitOptions.RemoveEmptyEntries).ToList(),
                                    Dir = data.WorkingDir,
                                    Mounts = HandleServiceMounts(data.Binds),
                                    TTY = data.TTY,
                                    Labels = new Dictionary<string, string>
                                    {
                                        { "com.container.company.id", data.Company == null ? "-" : data.Company.Id.ToString() }
                                    }
                                },
                                RestartPolicy = new SwarmRestartPolicy
                                {
                                    Condition = data.RestartCondition,
                                    Delay = data.RestartDelay,
                                    MaxAttempts = data.RestartMaxAttempts,
                                    Window = data.RestartWindow
                                },
                                Resources = new ResourceRequirements
                                {
                                    Limits = new SwarmResources
                                    {
                                        MemoryBytes = data.Memory,
                                        NanoCPUs = data.NanoCpus
                                    },
                                    Reservations = new SwarmResources
                                    {
                                        MemoryBytes = data.MemoryReservation,
                                        NanoCPUs = data.NanoCpusReservation
                                    }
                                }
                            },
                            UpdateConfig = new SwarmUpdateConfig
                            {
                                Delay = data.UpdateDelay,
                                Parallelism = data.UpdateParallelism,
                                FailureAction = data.UpdateFailureAction,
                                Order = data.UpdateOrder
                            },
                            EndpointSpec = new EndpointSpec()
                            {
                                Ports = HandleServicePorts(data.Ports),
                            },
                            Name = data.Name
                        },
                        RegistryAuth = CreateAuthConfig(data.FromSrc)
                    },
                    default
                 );

                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.CreateSwarmServiceResponse,
                    Result = result
                };

            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> UpdateSwarmServiceReplicas(UpdateServiceReplicaDto model)
        {
            try
            {
                var service = await _client.Swarm.InspectServiceAsync(model.Id, default);

                if (service == null)
                {
                    return new DockerHubResponse
                    {
                        Result = "Error No Service Found",
                        Success = false,
                        Type = DockerHubResponseType.DockerApiExceptionResponse
                    };
                }

                var parameters = new ServiceUpdateParameters
                {
                    Version = (long)service.Version.Index,
                    Service = service.Spec
                };
                parameters.Service.Mode.Replicated.Replicas = model.Replicas;

                var result = await _client.Swarm.UpdateServiceAsync(service.ID, parameters);

                return new DockerHubResponse
                {
                    Result = result,
                    Success = true,
                    Type = DockerHubResponseType.UpdateSwarmServiceReplicasResponse
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }

        }

        public async Task<DockerHubResponse> RemoveSwarmService(string id)
        {
            try
            {
                await _client.Swarm.RemoveServiceAsync(id, default);

                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.DeleteSwarmServiceResponse,
                    Result = true
                };

            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        #endregion

        #region All About Docker Images

        public async Task<DockerHubResponse> GetImageListAsync()
        {
            try
            {
                var result = await _client.Images.ListImagesAsync(
                    new ImagesListParameters()
                    {

                    });

                result = result.OrderBy(a => a.ID).ToList();
                var containers = await _client.Containers.ListContainersAsync(new ContainersListParameters { All = true });
                result.ToList().ForEach(i => i.Containers = containers.Where(c => c.ImageID == i.ID).Count());

                return new DockerHubResponse
                {
                    Result = result,
                    Success = true,
                    Type = DockerHubResponseType.ImageListResponse
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> GetImageHistoryListAsync(string id)
        {
            try
            {
                var result = await _client.Images.GetImageHistoryAsync(id);
                return new DockerHubResponse
                {
                    Result = result,
                    Success = true,
                    Type = DockerHubResponseType.ImageHistoryResponse
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> GetImageInspectAsync(string id)
        {
            try
            {
                var result = await _client.Images.InspectImageAsync(id);
                return new DockerHubResponse
                {
                    Result = result,
                    Success = true,
                    Type = DockerHubResponseType.InspectImageResponse
                };

            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> TagImageAsync(string id, string repositoryName, string tag, DockerRegistryDto fromSrc)
        {
            try
            {
                await _client.Images.TagImageAsync(id,
                    new ImageTagParameters()
                    {
                        Force = true,
                        RepositoryName = $"{Helper.RegistryUrlWorker(fromSrc.RegistryUrl)}/{repositoryName}",
                        Tag = tag
                    }, default);
                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.TagImageResponse,
                    Result = true
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> CreateNewImageFromImage(CreateImageDto model)
        {
            try
            {
                if (_imageProgress == null)
                {
                    _imageProgress = new Progress<JSONMessage>();
                    _imageProgress.ProgressChanged += _imageProgress_ProgressChanged;
                }

                await _client.Images.CreateImageAsync(
                              new ImagesCreateParameters
                              {
                                  FromImage =
                                  $"{Helper.RegistryUrlWorker(model.FromSrc.RegistryUrl)}/" +
                                  $"{(model.FromImage.Contains(':') ? model.FromImage : $"{model.FromImage}:latest")}",
                                  FromSrc = model.FromSrc.RegistryUrl     // "https://registry-1.docker.io",
                              },
                              CreateAuthConfig(model.FromSrc),
                              _imageProgress,
                              default
                       );

                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.CreateImageFromImageResponse,
                    Result = true
                };

            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        private async void _imageProgress_ProgressChanged(object sender, JSONMessage e)
        {
            try
            {
                await _progressHub.Clients.All.SendAsync("imageProgressUpdate", e);
            }
            catch (Exception ex)
            {
                _logger.LogError("imageProgressUpdate", $"Error: {ex.Message}");
                await _progressHub.Clients.All.SendAsync("imageProgressUpdate", $"Error: {ex.Message}");
            }
        }

        public async Task<Stream> CreateImageFromDockerFile(Stream stream, string dockerFile, string image)
        {
            return await _client.Images.BuildImageFromDockerfileAsync(stream, new ImageBuildParameters
            {
                Remove = true,
                ForceRemove = true,
                Dockerfile = dockerFile,
                Tags = new List<string>
                {
                    image,
                }
            }, default);
        }

        public async Task<DockerHubResponse> PushImageAsync(string repoName, string imageId, string tag, DockerRegistryDto fromSrc)
        {
            try
            {
                var progress = new Progress<JSONMessage>();
                progress.ProgressChanged += _imagePushProgress_ProgressChanged;

                await _client.Images.PushImageAsync($"{Helper.RegistryUrlWorker(fromSrc.RegistryUrl)}/{repoName}",
                    new ImagePushParameters
                    {
                        ImageID = imageId,
                        Tag = tag
                    },
                    CreateAuthConfig(fromSrc),
                    progress,
                    default);
                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.PushImageResponse,
                    Result = true
                };

            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        private async void _imagePushProgress_ProgressChanged(object sender, JSONMessage e)
        {
            await _progressHub.Clients.All.SendAsync("imagePushProgressUpdate", e);
        }

        public async Task<DockerHubResponse> CommitConatinerChangeAsync(CreateImageFromContainerDto model)
        {
            try
            {
                var result = await _client.Images.CommitContainerChangesAsync(
                  new CommitContainerChangesParameters
                  {
                      ContainerID = model.ContainerID,
                      RepositoryName = model.RepositoryName,
                      Comment = model.Comment,
                      Tag = model.Tag,
                      Pause = model.Pause,

                      Config = new Config
                      {
                          Image = model.Config.ImageName,
                          Hostname = model.Config.Hostname,
                          Domainname = model.Config.Domainname,
                          Cmd = model.Config.Cmd,
                          Env = model.Config.Env,
                          ExposedPorts = string.IsNullOrEmpty(model.Config.ExposedPorts) ? null :
                          new Dictionary<string, EmptyStruct>()
                          {
                             { $"{model.Config.ExposedPorts}/tcp", new EmptyStruct() }
                          },

                          Volumes = string.IsNullOrEmpty(model.Config.Volumes) ? null : new Dictionary<string, EmptyStruct>()
                          {
                            {  $"{model.Config.Volumes}", new EmptyStruct() },
                          }
                      }

                  }, default);

                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.DockerApiExceptionResponse,
                    Result = result
                };

            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> SearchForImageAsync(string searchTerms, DockerRegistryDto dockerRegistry)
        {
            try
            {
                // ISSUE: Searching only in hub.docker.com
                var result = await _client.Images.SearchImagesAsync(
                    new ImagesSearchParameters
                    {
                        Term = searchTerms,
                        RegistryAuth = CreateAuthConfig(dockerRegistry)
                    },
                    default);
                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.SearchForImageResponse,
                    Result = result
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> PruneImageAsync()
        {
            try
            {
                var result = await _client.Images.PruneImagesAsync(null, default);

                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.ImagesPruneResponse,
                    Result = result
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> DeleteImageAsync(string id)
        {
            try
            {
                var tempId = id.Substring(7, 12);
                var result = await _client.Images.DeleteImageAsync(tempId,
                    new ImageDeleteParameters
                    {
                        Force = true,
                        NoPrune = false
                    }, default);

                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.DeleteImageResponse,
                    Result = result
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        #endregion

        #region All About Docker Network

        public async Task<DockerHubResponse> GetNetworkListAsync()
        {
            try
            {
                var result = await _client.Networks.ListNetworksAsync(new NetworksListParameters(), default);
                result = result.OrderBy(a => a.Name).ToList();
                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.NetworkListResponse,
                    Result = result
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }


            /*{
                Filters = new Dictionary<string, IDictionary<string, bool>>
                {
                   {
                     "driver", new Dictionary<string, bool>
                      {
                         {"none", false}
                      }
                   }
                }
            }) ;*/

        }

        public async Task<DockerHubResponse> CreateNetworkAsync(string name, bool checkDuplicate, bool enableIPv6)
        {
            try
            {
                var result = await _client.Networks.CreateNetworkAsync(
                    new NetworksCreateParameters
                    {
                        Name = name,
                        CheckDuplicate = checkDuplicate,
                        Internal = false,
                        EnableIPv6 = enableIPv6,
                        Driver = "bridge",
                    }, default);

                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.CreateNetworkResponse,
                    Result = result
                };

            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }

        }

        public async Task<DockerHubResponse> DeleteNetworkAsync(string id)
        {
            try
            {
                await _client.Networks.DeleteNetworkAsync(id, cancellationToken: CancellationToken.None);

                return new DockerHubResponse
                {
                    Result = true,
                    Success = true,
                    Type = DockerHubResponseType.DeleteNetworkResponse
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> InspectNetworkAsync(string id)
        {
            try
            {
                var result = await _client.Networks.InspectNetworkAsync(id, cancellationToken: CancellationToken.None);
                return new DockerHubResponse
                {
                    Result = result,
                    Success = true,
                    Type = DockerHubResponseType.InspectNetworkResponse
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }

        }

        public async Task<DockerHubResponse> ConnectNetworkAsync(string networkId, string containerId)
        {
            try
            {
                await _client.Networks.ConnectNetworkAsync(networkId,
                     new NetworkConnectParameters
                     {
                         Container = containerId
                     }, default);

                return new DockerHubResponse
                {
                    Result = true,
                    Success = true,
                    Type = DockerHubResponseType.ConnectNetworkResponse
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> DisconnectNetworkAsync(string networkId, string containerId)
        {
            try
            {
                await _client.Networks.DisconnectNetworkAsync(networkId,
                    new NetworkDisconnectParameters
                    {
                        Container = containerId,
                        Force = true
                    }, default);

                return new DockerHubResponse
                {
                    Result = true,
                    Success = true,
                    Type = DockerHubResponseType.DisconnectNetworkResponse
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> PruneNetworkAsync()
        {
            try
            {
                var result = await _client.Networks.PruneNetworksAsync(null, default);

                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.NetworksPruneResponse,
                    Result = result
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        #endregion

        #region All About Docker Volumes

        public async Task<DockerHubResponse> GetVolumesListAsync()
        {
            try
            {
                var result = await _client.Volumes.ListAsync(cancellationToken: default);
                result.Volumes = result.Volumes.OrderBy(a => a.Name).ToList();
                return new DockerHubResponse
                {
                    Result = result,
                    Success = true,
                    Type = DockerHubResponseType.VolumeListResponse
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> GetVolumesInspectAsync(string name)
        {
            try
            {
                var result = await _client.Volumes.InspectAsync(name, cancellationToken: default);
                return new DockerHubResponse
                {
                    Result = result,
                    Success = true,
                    Type = DockerHubResponseType.InspectVolumeResponse
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> CreateVolumesAsync(VolumesCreateParameters model)
        {
            try
            {
                var result = await _client.Volumes.CreateAsync(
                    new VolumesCreateParameters
                    {
                        Driver = model.Driver,
                        Name = model.Name,
                    }, cancellationToken: default);

                return new DockerHubResponse
                {
                    Result = result,
                    Success = true,
                    Type = DockerHubResponseType.CreateVolumeResponse
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }

        }

        public async Task<DockerHubResponse> RemoveVolumes(string name)
        {
            try
            {
                await _client.Volumes.RemoveAsync(name, force: true, cancellationToken: default);

                return new DockerHubResponse
                {
                    Result = true,
                    Success = true,
                    Type = DockerHubResponseType.DeleteVolumeResponse
                };

            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> PruneVolumes()
        {
            try
            {
                var result = await _client.Volumes.PruneAsync(cancellationToken: default);
                return new DockerHubResponse
                {
                    Result = result,
                    Success = true,
                    Type = DockerHubResponseType.PruneVolumeResponse
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }

        }

        #endregion

        #region All About Docker Containers

        public async Task<DockerHubResponse> GetContainersListAsync()
        {
            try
            {

                var result = await _client.Containers.ListContainersAsync(
                    new ContainersListParameters()
                    {
                        All = true
                    });

                return new DockerHubResponse
                {
                    Result = result,
                    Success = true,
                    Type = DockerHubResponseType.ContainerListResponse
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> StartContainerAsync(string id)
        {
            try
            {
                var result = await _client.Containers.StartContainerAsync(id,
                       new ContainerStartParameters
                       {
                           DetachKeys = id
                       }, default);
                return new DockerHubResponse
                {
                    Result = result,
                    Success = true,
                    Type = DockerHubResponseType.StartContainerResponse
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> RestartContainerAsync(string id)
        {
            try
            {
                await _client.Containers.RestartContainerAsync(id, new ContainerRestartParameters
                {

                }, default);
                return new DockerHubResponse
                {
                    Result = true,
                    Success = true,
                    Type = DockerHubResponseType.RestartContainerResponse
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> PauseContainerAsync(string id)
        {
            try
            {
                await _client.Containers.PauseContainerAsync(id, default);
                return new DockerHubResponse
                {
                    Result = true,
                    Success = true,
                    Type = DockerHubResponseType.PauseContainerResponse
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> UnPauseContainerAsync(string id)
        {
            try
            {
                await _client.Containers.UnpauseContainerAsync(id, default);
                return new DockerHubResponse
                {
                    Result = true,
                    Success = true,
                    Type = DockerHubResponseType.UnPauseContainerResponse
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> StopContainerAsync(string id)
        {
            try
            {
                var result = await _client.Containers.StopContainerAsync(id,
                    new ContainerStopParameters
                    {
                        WaitBeforeKillSeconds = 30
                    }, default);

                return new DockerHubResponse
                {
                    Result = result,
                    Success = true,
                    Type = DockerHubResponseType.StopContainerResponse
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> DeleteContainerAsync(string id)
        {
            try
            {
                await _client.Containers.RemoveContainerAsync(id,
                  new ContainerRemoveParameters
                  {
                      Force = true
                  },
                 default);

                return new DockerHubResponse
                {
                    Result = true,
                    Success = true,
                    Type = DockerHubResponseType.DeleteContainerResponse
                };

            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> RenameContainerAsync(string id, string newName)
        {
            try
            {
                await _client.Containers.RenameContainerAsync(id,
                     new ContainerRenameParameters
                     {
                         NewName = newName
                     }, default);

                return new DockerHubResponse
                {
                    Result = true,
                    Success = true,
                    Type = DockerHubResponseType.RenameContainerResponse
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> InspectContainerAsync(string id)
        {
            try
            {
                var result = await _client.Containers.InspectContainerAsync(id, CancellationToken.None);
                return new DockerHubResponse
                {
                    Result = result,
                    Success = true,
                    Type = DockerHubResponseType.ContainerInspectResponse
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        private (Dictionary<string, EmptyStruct>, Dictionary<string, IList<PortBinding>>) HandlePorts(IList<string> ports)
        {
            if (ports == null)
            {
                return (null, null);
            }
            var portBindings = new Dictionary<string, IList<PortBinding>>();
            var exposedPorts = new Dictionary<string, EmptyStruct>();
            foreach (var port in ports)
            {
                if (!port.Contains(':'))
                {
                    continue;
                }

                var portArray = port.Split(':');

                var publicPort = portArray[0];
                var exposedPort = portArray[1].Split('/')[0];
                var protocol =
                    portArray[1].Contains('/') ? !string.IsNullOrEmpty(portArray[1].Split('/')[1]) ? portArray[1].Split('/')[1] : "tcp" : "tcp";

                exposedPort = string.Format("{0}/{1}", exposedPort, protocol);
                if (exposedPorts.ContainsKey(exposedPort))
                {
                    continue;
                }

                exposedPorts.Add(exposedPort, new EmptyStruct());
                portBindings.Add(exposedPort, new List<PortBinding> { new PortBinding { HostPort = publicPort } });
            }

            return (exposedPorts, portBindings);
        }

        public async Task<DockerHubResponse> CreateContainerAsync(ContainerModel data)
        {
            try
            {
                // try to pull the img first if PullImage is set to true
                if (data.AlwaysPullImage)
                {
                    var imgResponse = await CreateNewImageFromImage(new CreateImageDto { FromImage = data.Image, FromSrc = data.FromSrc });
                    if (!imgResponse.Success)
                    {
                        return new DockerHubResponse
                        {
                            Success = false,
                            Result = imgResponse.Result,
                            Type = imgResponse.Type
                        };
                    }
                }

                var ports = HandlePorts(data.Ports);
                var environments = data.Env?.Split('\n', StringSplitOptions.RemoveEmptyEntries).ToList();
                var virtualHost = environments?.FirstOrDefault((env) => env.Contains("VIRTUAL_HOST"))?.Split('=')[1];
                var results = await _client.Containers.CreateContainerAsync(
                    new CreateContainerParameters
                    {
                        Name = $"{ data.Name}{(data.Company != null ? (!string.IsNullOrEmpty(data.Name) ? "_" : "") + data.Company.Id.ToString().Substring(0, 8) : "") }",
                        Hostname = data.Hostname,
                        NetworkDisabled = data.NetworkDisabled,
                        ArgsEscaped = data.ArgsEscaped,
                        Domainname = data.Domainname,
                        Image = $"{Helper.RegistryUrlWorker(data.FromSrc.RegistryUrl)}/{data.Image}",

                        MacAddress = data.MacAddress,
                        WorkingDir = data.WorkingDir,
                        Tty = data.Tty,
                        ExposedPorts = ports.Item1 == null ? null : ports.Item1,
                        Cmd = data.Cmd?.Split(' ', StringSplitOptions.RemoveEmptyEntries).ToList(),
                        Env = environments,
                        Entrypoint = data.EntryPoint == null ? null : data.EntryPoint.Split(' ', StringSplitOptions.RemoveEmptyEntries).ToList(),

                        Labels =
                        new Dictionary<string, string>
                        {
                            { "com.container.company.id", data.Company == null ? "-" : data.Company.Id.ToString() },
                            { "com.centurylinklabs.watchtower.enable",  data.AutoUpdate ? "true": "false" },
                            { "com.container.protected.state", data.IsProtected ? "true": "false" },
                            { "com.container.virtual.host", virtualHost ??= "-"}
                        },
                        HostConfig = new HostConfig
                        {
                            AutoRemove = data.AutoRemove,
                            DNS = data.DnsName,
                            NetworkMode = data.NetworkMode,
                            Binds = data.Binds, // data.Binds,
                            Links = data.Links,
                            Memory = data.Memory,
                            MemoryReservation = data.MemoryReservation,
                            NanoCPUs = Convert.ToInt64(data.NanoCPUs * 1000000000),
                            PublishAllPorts = data.PublishAllPorts,
                            Privileged = data.Privileged,
                            ReadonlyRootfs = data.ReadonlyRootfs,
                            PortBindings = ports.Item2 ?? null,
                            RestartPolicy = new RestartPolicy { Name = RestartPolicyKind.OnFailure, MaximumRetryCount = 5 }
                        }
                    });


                if (data.StartContainer)
                {
                    await StartContainerAsync(results.ID);
                }

                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.CreateContainerResponse,
                    Result = results
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> PruneContainerAsync(bool pruneProtected)
        {
            try
            {
                var result = await _client.Containers.PruneContainersAsync(new ContainersPruneParameters
                {
                    Filters =
                    pruneProtected ? null : new Dictionary<string, IDictionary<string, bool>>
                    {
                        {
                           "label!", new Dictionary<string, bool>
                            {
                                {
                                    "com.container.protected.state=true", true
                                }
                            }
                        }
                    }
                },
                default);

                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.ContainersPruneResponse,
                    Result = result
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> GetContainerStats(string id)
        {
            try
            {
                _containerStatId = id;
                if (_containerStatIds.Any(a => a == id))
                {
                    return new DockerHubResponse
                    {
                        Success = true,
                        Type = DockerHubResponseType.OperationSuccessfulResponse,
                        Result = "already registered"
                    };
                }

                _containerStatIds.Add(id);

                await _client.Containers.GetContainerStatsAsync(
                        id,
                        new ContainerStatsParameters()
                        {
                            Stream = true,

                        },
                       new Progress<ContainerStatsResponse>((e) =>
                       {
                           if (e.ID != _containerStatId)
                           {
                               return;
                           }
                           var isRunning = e.CPUStats.OnlineCPUs > 0 && e.MemoryStats.Stats != null;
                           if (!isRunning)
                           {
                               _progressHub.Clients.All.SendAsync("containerStatProgressUpdate", null);
                           }
                           else
                           {
                               ulong[] networkIO = new ulong[2] { 0, 0 };
                               foreach (var network in e.Networks)
                               {
                                   networkIO[0] += network.Value.RxBytes;
                                   networkIO[1] += network.Value.TxBytes;
                               }
                               var result = new
                               {
                                   id = e.ID,
                                   IsRunning = isRunning,
                                   CpuUsage = (double)e.CPUStats.CPUUsage.TotalUsage * 100 / e.CPUStats.SystemUsage,
                                   MemoryUsage = (double)e.MemoryStats.Usage,
                                   DiskRead = e.StorageStats.ReadSizeBytes,
                                   DiskWrite = e.StorageStats.WriteSizeBytes,
                                   NetworkIO = networkIO
                               };
                               _progressHub.Clients.All.SendAsync("containerStatProgressUpdate", result);
                           }

                       }),
                        default);

                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.OperationSuccessfulResponse,
                    Result = true
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> GetContainerLogs(string id)
        {
            try
            {
                var container = await _client.Containers.InspectContainerAsync(id, default);
                if (container == null)
                {
                    return new DockerHubResponse
                    {
                        Success = false,
                        Type = DockerHubResponseType.DockerApiExceptionResponse,
                        Result = "No such container"
                    };
                }

                var result = await _client.Containers.GetContainerLogsAsync(container.ID, container.Config.Tty, new ContainerLogsParameters
                {
                    ShowStdout = true,
                    Tail = "200"

                }, default);

                var res = await result.ReadOutputToEndAsync(default);
                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.OperationSuccessfulResponse,
                    Result = res.stdout
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
        }

        public async Task<DockerHubResponse> ExecCreateContainerAsync(string id, string cmd, string user)
        {
            var config = new ContainerExecCreateParameters
            {
                Cmd = new string[] { cmd },
                AttachStderr = true,
                AttachStdin = true,
                AttachStdout = true,
                Detach = false,
                Tty = false,
                User = user,
                Privileged = true
            };
            try
            {
                var result = await _client.Exec.ExecCreateContainerAsync(id, config);
                _execRootCmd = cmd;
                _execUser = user;
                return new DockerHubResponse
                {
                    Success = true,
                    Type = DockerHubResponseType.OperationSuccessfulResponse,
                    Result = result.ID
                };
            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }            
        }

        public async Task<DockerHubResponse> ExecStart(string containerid, string cmd)
        {
            var runningCmd = cmd.Split(' ')[0];
            var config = new ContainerExecCreateParameters
            {
                Cmd = new string[] { _execRootCmd },
                AttachStderr = true,
                AttachStdin = true,
                AttachStdout = true,
                Detach = false,
                Tty = false,
                User = _execUser,
                Privileged = true
            };
            try
            {
                var execResult = await _client.Exec.ExecCreateContainerAsync(containerid, config);
                using (var stream = await _client.Exec.StartAndAttachContainerExecAsync(execResult.ID, false))
                {
                    var inspect = await _client.Exec.InspectContainerExecAsync(execResult.ID);
                    var tRead = Task.Run(async () =>
                    {
                        var dockerBuffer = System.Buffers.ArrayPool<byte>.Shared.Rent(81920);
                        try
                        {
                            for (; ; )
                            {
                                // Clear buffer
                                Array.Clear(dockerBuffer, 0, dockerBuffer.Length);
                                var dockerReadResult = await stream.ReadOutputAsync(dockerBuffer, 0, dockerBuffer.Length, default(CancellationToken));


                                var res = Encoding.Default.GetString(dockerBuffer, 0, dockerReadResult.Count);

                                    await _progressHub.Clients.All.SendAsync("ExecResponse", new
                                {
                                    ExecID = execResult.ID,
                                    ExecInspect = inspect ?? new ContainerExecInspectResponse(),
                                    Result = res,
                                    RunningCmd = runningCmd
                                });

                                if (dockerReadResult.EOF)
                                    return;
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Failure during Read from Docker Exec to WebSocket");
                        }

                        System.Buffers.ArrayPool<byte>.Shared.Return(dockerBuffer);
                    }, CancellationToken.None);


                    // Write to Docker                             
                    var tWrite = Task.Run(async () =>
                    {
                        // Read only small amount of chars at once (performance)!
                        var wsBuffer = System.Buffers.ArrayPool<byte>.Shared.Rent(1024);
                        try
                        {
                            while (true)
                            {
                                // Clear buffer
                                Array.Clear(wsBuffer, 0, wsBuffer.Length);

                                var _cmd = Encoding.UTF8.GetBytes($"{cmd}\n");
                                await stream.WriteAsync(_cmd, 0, _cmd.Length,
                                    default(CancellationToken));

                                break;
                            }
                        }

                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Failure during Write to Docker Exec from WebSocket");
                        }
                        System.Buffers.ArrayPool<byte>.Shared.Return(wsBuffer);
                    });

                    await tWrite.ConfigureAwait(true);
                    stream.CloseWrite();
                    await tRead.ConfigureAwait(true);

                }

                return new DockerHubResponse
                {
                    Result = execResult.ID,
                    Success = true,
                    Type = DockerHubResponseType.OperationSuccessfulResponse
                };

            }
            catch (DockerApiException ex)
            {
                _logger.LogError(Helper.SerialErrorMessage(ex));
                return Helper.GetDockerHubResponse(ex);
            }
            
        }


        #endregion


    }

    public class Progress : IProgress<JSONMessage>
    {
        public void Report(JSONMessage value)
        {
            Debug.WriteLine(value.ToString());
        }
    }
}
