import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MaterialModule } from '../material.module';
import { DataPropertyGetterPipe } from './data-property-getter.pipe';
import { TableWidgetComponent } from './table-widget.component';

@NgModule({
  declarations: [TableWidgetComponent, DataPropertyGetterPipe],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [TableWidgetComponent, DataPropertyGetterPipe],
})
export class TableWidgetModule {

  static forRoot(): ModuleWithProviders<TableWidgetModule> {
    return {
      ngModule: TableWidgetModule,
      providers: [],
    };
  }


}
