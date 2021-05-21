
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from '@app/layout/main-layout/main-layout.component';
import { IMainRouting } from '@app/main-routing';
import { AuthGuard } from '@app/shared/services/auth/auth-guard.service';
import { ContainerGraphComponent } from './container-graph/container-graph.component';
import { HomeComponent } from './home/home.component';
import { ImageGraphComponent } from './image-graph/image-graph.component';
import { NetworkGraphComponent } from './network-graph/network-graph.component';
import { VolumeGraphComponent } from './volume-graph/volume-graph.component';

const routes: Routes = [
  {
    path: 'dashboard', component: MainLayoutComponent,
    children: [
      { path: 'home', component: HomeComponent }
    ],
    canActivate: [AuthGuard]
  }
];

export const DashboardRoutingModule: IMainRouting = {
  routes: RouterModule.forChild(routes),
  components: [
    HomeComponent,
    ContainerGraphComponent,
    ImageGraphComponent,
    NetworkGraphComponent,
    VolumeGraphComponent
  ],
};
