import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '@app/shared/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { BlankLayoutComponent } from './black-layout/blank-layout.component';
import { FooterComponent } from './footer/footer.component';
import { ChangePasswordComponent } from './header/change-password/change-password.component';
import { HeaderComponent } from './header/header.component';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { SidenavComponent } from './sidenav/sidenav.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    SidenavComponent,
    BlankLayoutComponent,
    MainLayoutComponent,
    ChangePasswordComponent,
  ],

  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MaterialModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ],

  exports: [
    HeaderComponent,
    FooterComponent,
    SidenavComponent,
    MainLayoutComponent,
    BlankLayoutComponent,
  ],
})
export class LayoutModule {}
