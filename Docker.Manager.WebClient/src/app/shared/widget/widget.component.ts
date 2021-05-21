import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  HostBinding,
  QueryList,
  Renderer2,
  ViewEncapsulation
} from '@angular/core';
import { WidgetToggleDirective } from './widget-toggle.directive';


@Component({
  selector: 'tps-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],

  encapsulation: ViewEncapsulation.None
})
export class WidgetComponent implements AfterContentInit {

  @HostBinding('class.flipped')
  flipped = false;

  @ContentChildren(WidgetToggleDirective, { descendants: true })
  toggleButtons: QueryList<WidgetToggleDirective>;

  constructor(
    private _elementRef: ElementRef,
    private _renderer: Renderer2
  ) { }

  ngAfterContentInit(): void {
    // Listen for the flip button click
    setTimeout(() => {
      this.toggleButtons.forEach(flipButton => {
        this._renderer.listen(flipButton.elementRef.nativeElement, 'click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.toggle();
        });
      });
    });
  }

  toggle(): void {
    this.flipped = !this.flipped;
  }

}
