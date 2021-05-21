import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { LayoutModule } from '@app/layout/layout.module';
import { TranslateModule } from '@ngx-translate/core';
import { AccessDeniedRouting } from './access-denied-routing.module';
import { AccessDeniedComponent } from './access-denied.component';

@NgModule({
  declarations: [AccessDeniedComponent],
  imports: [
    CommonModule,
    FormsModule,

    MatRadioModule,

    TranslateModule,
    LayoutModule,

    AccessDeniedRouting,
  ],

  exports: [AccessDeniedComponent],
})
export class AccessDeniedModule {
  static forRoot(): ModuleWithProviders<AccessDeniedModule> {
    return {
      ngModule: AccessDeniedModule,
      providers: [],
    };
  }
}
