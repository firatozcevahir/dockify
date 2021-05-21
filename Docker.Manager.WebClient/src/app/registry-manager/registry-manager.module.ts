import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonLoadingModule } from '@app/shared/directives/mat-button-loading.module';
import { MaterialModule } from '@app/shared/material.module';
import { SharedModule } from '@app/shared/shared.module';
import { WidgetModule } from '@app/shared/widget/widget.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { UiSwitchModule } from 'ngx-ui-switch';
import { RegistryManagerRoutingModule } from './registry-manager-routing.module';


@NgModule({
  declarations: [RegistryManagerRoutingModule.components],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MaterialModule,

    TranslateModule,
    UiSwitchModule,

    NgSelectModule,

    LayoutModule,
    SharedModule,
    WidgetModule,
    MatButtonLoadingModule,

    RegistryManagerRoutingModule.routes,
  ],
  exports: [RegistryManagerRoutingModule.components]
})
export class RegistryManagerModule {
  static forRoot(): ModuleWithProviders<RegistryManagerModule> {
    return {
      ngModule: RegistryManagerModule,
      providers: [],
    };
  }
}
