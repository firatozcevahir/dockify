import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlankLayoutComponent } from '@app/layout/black-layout/blank-layout.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: 'security', component: BlankLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class SecurityRouting {}
