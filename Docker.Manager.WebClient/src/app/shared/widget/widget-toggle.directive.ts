import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[tpsWidgetToggle]'
})
export class WidgetToggleDirective {

  constructor(
    public elementRef: ElementRef
  ) {
  }

}
