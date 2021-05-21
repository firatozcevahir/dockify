import { RouterModule, Routes } from '@angular/router';
import { EditDockerTemplateComponent } from '@app/application/image-templates/edit/edit-docker-template.component';
import { DockerTemplateComponent } from '@app/application/image-templates/list/docker-template.component';
import { SettingsComponent } from '@app/application/settings/list/settings.component';
import { TenantsComponent } from '@app/application/tenants/list/tenants.component';
import { MainLayoutComponent } from '@app/layout/main-layout/main-layout.component';
import { IMainRouting } from '@app/main-routing';
import { CheckTutorial } from '@app/shared/services/check-tutorial.service';
import { ContainerDetailsComponent } from './containers/container-details/container-details.component';
import { ExecComponent } from './containers/exec/exec.component';
import { ContainerDirectoriesComponent } from './containers/container-directories/container-directories.component';
import { ContainerLogsComponent } from './containers/container-logs/container-logs.component';
import { ContainerStatsComponent } from './containers/container-stats/container-stats.component';
import { CreateImageFromContainerComponent } from './containers/create-image/create-image-from-container.component';
import { EditContainerComponent } from './containers/edit/edit-container.component';
import { ContainersComponent } from './containers/list/containers.component';
import { DockerDetailComponent } from './docker-manager/docker-detail/docker-detail.component';
import { EditDockerImageComponent } from './docker-manager/edit/edit-docker-image.component';
import { DockerManagerComponent } from './docker-manager/list/docker-manager.component';
import { PushToRegistryComponent } from './docker-manager/push-to-registry/push-to-registry.component';
import { ImageSelectorComponent } from './image-selector/image-selector.component';
import { SearchImageComponent } from './image-templates/search-image/search-image.component';
import { K8Component } from './k8/list/k8.component';
import { EditNetworkComponent } from './networks/edit/edit-network.component';
import { NetworksComponent } from './networks/list/networks.component';
import { CreateServiceComponent } from './services/edit/create-service.component';
import { ListTasksComponent } from './services/list-tasks/list-tasks.component';
import { ServicesComponent } from './services/list/services.component';
import { EditSettingComponent } from './settings/edit/edit-setting.component';
import { CreateSwarmComponent } from './swarms/create/create-swarm.component';
import { InspectSwarmComponent } from './swarms/inspect/inspect-swarm.component';
import { JoinSwarmComponent } from './swarms/join/join-swarm.component';
import { LeaveSwarmComponent } from './swarms/leave/leave-swarm.component';
import { SwarmsComponent } from './swarms/list/swarms.component';
import { NodeDetailsComponent } from './swarms/node-details/node-details.component';
import { UpdateSwarmComponent } from './swarms/update/update-swarm.component';
import { EditTenantComponent } from './tenants/edit/edit-tenant.component';
import { TutorialComponent } from './tutorial/tutor/tutorial.component';
import { TutorVideoComponent } from './tutorial/video/tutor-video.component';
import { EditVolumeComponent } from './volumes/edit/edit-volume.component';
import { VolumesComponent } from './volumes/list/volumes.component';
import { ShellscriptsComponent} from './shellscripts/list/shellscripts.component';
import { EditShellscriptsComponent } from './shellscripts/edit/edit-shellscripts.component';
import { AuthGuard } from '@app/shared/services/auth/auth-guard.service';


const routes: Routes = [
  {
    path: 'app',
    component: MainLayoutComponent, // canActivateChild: [AuthGuard],
    children: [
      {
        path: 'image-template', component: DockerTemplateComponent,
        //      data: { Roles: { permittedRoles: ['Admin'] } as IGuardPermission },
        children: [
          { path: 'add', component: EditDockerTemplateComponent },
          { path: 'edit/:id/:state', component: EditDockerTemplateComponent },
        ]
      },
      {
        path: 'docker-manager', component: DockerManagerComponent,
        children: [
          { path: 'add', component: EditDockerImageComponent },
          { path: 'detail/:id', component: DockerDetailComponent }
        ]
      },
      {
        path: 'tenants', component: TenantsComponent,
        children: [
          { path: 'add', component: EditTenantComponent },
          { path: 'edit/:id', component: EditTenantComponent },
        ]
      },
      {
        path: 'docker-networks', component: NetworksComponent,
        children: [
          { path: 'add', component: EditNetworkComponent },
          { path: 'edit/:id', component: EditNetworkComponent },
        ]
      },
      {
        path: 'docker-containers', component: ContainersComponent,
        children: [
          { path: 'add', component: EditContainerComponent },
          { path: 'edit/:id', component: EditContainerComponent },
          { path: 'detail/:id', component: DockerDetailComponent },
          { path: 'create-image/:id', component: CreateImageFromContainerComponent },
        ]
      },
      {
        path: 'docker-volumes', component: VolumesComponent,
        children: [
          { path: 'add', component: EditVolumeComponent },
          { path: 'edit/:id', component: EditVolumeComponent }
        ]
      },
      {
        path: 'swarm', component: SwarmsComponent,
        children: [
          { path: 'create', component: CreateSwarmComponent },
          { path: 'join', component: JoinSwarmComponent },
          { path: 'leave', component: LeaveSwarmComponent },
          { path: 'update', component: UpdateSwarmComponent },
          { path: 'service', component: CreateServiceComponent }
        ]
      },
      {
        path: 'k8', component: K8Component
      },
      {
        path: 'tutorial', component: TutorialComponent,
        canLoad: [CheckTutorial]
      },
      {
        path: 'services', component: ServicesComponent,
        children: [
          { path: 'add', component: CreateServiceComponent }
        ]
      },
      {
        path: 'settings', component: SettingsComponent,
        children: [
          { path: 'add', component: EditSettingComponent },
          { path: 'edit/:id', component: EditSettingComponent },
        ]
      },
      {
        path: 'shell-scripts', component: ShellscriptsComponent,
        children: [
          {path: 'add', component: EditShellscriptsComponent},
          {path: 'edit/:id', component: EditShellscriptsComponent},
        ]
      }
    ],
    canActivate: [AuthGuard]
  },
];

export const ApplicationRouting: IMainRouting = {
  routes: RouterModule.forChild(routes),
  components: [
    DockerTemplateComponent,
    PushToRegistryComponent,
    EditDockerTemplateComponent,
    DockerManagerComponent,
    EditDockerImageComponent,
    TenantsComponent,
    NetworksComponent,
    EditNetworkComponent,
    ContainersComponent,
    EditContainerComponent,
    DockerDetailComponent,
    SettingsComponent,
    SearchImageComponent,
    ImageSelectorComponent,
    ContainerStatsComponent,
    ContainerDetailsComponent,
    ExecComponent,
    EditTenantComponent,
    EditSettingComponent,
    SwarmsComponent,
    CreateSwarmComponent,
    JoinSwarmComponent,
    LeaveSwarmComponent,
    UpdateSwarmComponent,
    CreateServiceComponent,
    NodeDetailsComponent,
    VolumesComponent,
    EditVolumeComponent,
    ServicesComponent,
    ListTasksComponent,
    InspectSwarmComponent,
    ContainerLogsComponent,
    ContainerDirectoriesComponent,
    ShellscriptsComponent,
    EditShellscriptsComponent,
    K8Component,
    TutorialComponent,
    TutorVideoComponent,
    CreateImageFromContainerComponent
  ],
};
