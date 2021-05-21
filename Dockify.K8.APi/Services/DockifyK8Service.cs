using AutoMapper.Configuration;
using k8s;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Dockify.K8.Api.Services
{
    public interface IDockifyK8Service
    {

    }

    public class DockifyK8Service : IDockifyK8Service
    {
        private readonly ILogger<DockifyK8Service> _logger;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        private KubernetesClientConfiguration _client;
        private Kubernetes _knet8; 

        public DockifyK8Service(
            ILogger<DockifyK8Service> logger,
            IServiceScopeFactory serviceScopeFactory
            )
        {
            _logger = logger;
            _serviceScopeFactory = serviceScopeFactory;
            using var scope = _serviceScopeFactory.CreateScope();
            var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

            _client = KubernetesClientConfiguration.BuildConfigFromConfigFile(Environment.GetEnvironmentVariable("KUBECONFIG"));

        }
    }
}
