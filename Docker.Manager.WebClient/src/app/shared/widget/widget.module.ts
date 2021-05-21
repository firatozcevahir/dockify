import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { WidgetToggleDirective } from './widget-toggle.directive';
import { WidgetComponent } from './widget.component';

@NgModule({
  declarations: [WidgetComponent, WidgetToggleDirective],
  imports: [
    CommonModule
  ],
  exports: [WidgetComponent, WidgetToggleDirective],
})
export class WidgetModule { }
