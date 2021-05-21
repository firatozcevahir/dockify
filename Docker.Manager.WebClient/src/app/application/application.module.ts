import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardModule } from '@app/dashboard/dashboard.module';
import { LayoutModule } from '@app/layout/layout.module';
import { MatButtonLoadingModule } from '@app/shared/directives/mat-button-loading.module';
import { MaterialModule } from '@app/shared/material.module';
import { SharedModule } from '@app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { TagInputModule } from 'ngx-chips';
import { UiSwitchModule } from 'ngx-ui-switch';
import { ApplicationRouting } from './application-routing.module';

@NgModule({
  declarations: [ApplicationRouting.components],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MaterialModule,

    TranslateModule,
    UiSwitchModule,
    TagInputModule,

    NgSelectModule,

    LayoutModule,
    SharedModule,
    DashboardModule,
    MatButtonLoadingModule,

    ApplicationRouting.routes,
  ],
})
export class ApplicationModule {

  static forRoot(): ModuleWithProviders<ApplicationModule> {
    return {
      ngModule: ApplicationModule,
      providers: [],
    };
  }
}
