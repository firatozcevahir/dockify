import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/services/auth/auth-guard.service';

const routes: Routes = [
  { path: '', redirectTo: 'security/login', pathMatch: 'full' },
  {
    path: 'security',
    loadChildren: () =>
      import('@app/security/security.module').then((m) => m.SecurityModule),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('@app/dashboard/dashboard.module').then((m) => m.DashboardModule)
  },
  {
    path: 'app',
    loadChildren: () =>
      import('@app/application/application.module').then((m) => m.ApplicationModule)
  },
  {
    path: 'access',
    loadChildren: () =>
      import('@app/accessdenied/access-denied.module').then((m) => m.AccessDeniedModule)
  },
  {

    path: 'registry-manager',
    loadChildren: () =>
      import('@app/registry-manager/registry-manager.module').then((m) => m.RegistryManagerModule)
  },

  { path: '**', redirectTo: 'access/denied', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
