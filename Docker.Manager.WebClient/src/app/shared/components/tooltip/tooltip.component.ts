import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { TooltipPosition } from '@angular/material/tooltip';

@Component({
  selector: 'tps-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TooltipComponent implements OnInit {

  @Input() msg: string;
  @Input() position: TooltipPosition = 'above';
  @Input() icon = 'help';
  constructor() { }

  ngOnInit(): void {
  }

}
