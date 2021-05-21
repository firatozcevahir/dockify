import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { LayoutModule } from '@app/layout/layout.module';
import { MatButtonLoadingModule } from '@app/shared/directives/mat-button-loading.module';
import { MaterialModule } from '@app/shared/material.module';
import { SharedModule } from '@app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { LoginComponent } from './login/login.component';
import { SecurityRouting } from './security-routing.module';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatRadioModule,

    TranslateModule,

    MaterialModule,
    LayoutModule,

    SharedModule,
    MatButtonLoadingModule,

    SecurityRouting,
  ],

  exports: [LoginComponent],
})
export class SecurityModule {
  static forRoot(): ModuleWithProviders<SecurityModule> {
    return {
      ngModule: SecurityModule,
      providers: [],
    };
  }
}
