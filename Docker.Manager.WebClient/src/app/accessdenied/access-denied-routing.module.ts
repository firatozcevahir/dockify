import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from '@app/layout/main-layout/main-layout.component';
import { AccessDeniedComponent } from './access-denied.component';

const routes: Routes = [
  {
    path: 'access',
    component: MainLayoutComponent,
    children: [{ path: 'denied', component: AccessDeniedComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccessDeniedRouting {}
