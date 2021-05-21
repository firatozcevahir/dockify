import { Directive, ElementRef, HostBinding, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import ECharts = echarts.ECharts;
import EChartOption = echarts.EChartOption;


@Directive({
  selector: '[tpsMyEcharts]',
})
export class MyEchartsDirective implements OnChanges, OnInit, OnDestroy {
  private chart: ECharts;
  private sizeCheckInterval = null;
  private reSize$ = new Subject<string>();
  private onResize: Subscription;

  @Input('tpsMyEcharts') options: EChartOption;

  @HostBinding('style.height.px')
  elHeight: number;

  constructor(private el: ElementRef) {
    this.chart = echarts.init(this.el.nativeElement, 'tpsEchart');
  }

  ngOnChanges(changes: any): void {
    if (this.options) {
      this.chart.setOption(this.options);
    }
  }

  ngOnInit(): void {
    this.sizeCheckInterval = setInterval(() => {
      this.reSize$.next(`${this.el.nativeElement.offsetWidth}:${this.el.nativeElement.offsetHeight}`);
    }, 100);

    this.onResize = this.reSize$.pipe(
      distinctUntilChanged()
    ).subscribe((_) => this.chart.resize());

    this.elHeight = this.el.nativeElement.offsetHeight;
    if (this.elHeight < 300) {
      this.elHeight = 300;
    }
  }

  ngOnDestroy(): void {
    if (this.sizeCheckInterval) {
      clearInterval(this.sizeCheckInterval);
    }
    this.reSize$.complete();
    if (this.onResize) {
      this.onResize.unsubscribe();
    }
  }

}
