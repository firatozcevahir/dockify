import { Routes, RouterModule } from '@angular/router';
import { MainLayoutComponent } from '@app/layout/main-layout/main-layout.component';
import { IMainRouting } from '@app/main-routing';
import { AuthGuard } from '@app/shared/services/auth/auth-guard.service';
import { HomeComponent } from './home/home.component';

const routes: Routes = [{
  path: 'registry-manager', component: MainLayoutComponent,
  children: [
    { path: 'home', component: HomeComponent }
  ],
  canActivate: [AuthGuard]
}];

export const RegistryManagerRoutingModule: IMainRouting = {
  routes: RouterModule.forChild(routes),
  components: [
    HomeComponent
  ],
};
