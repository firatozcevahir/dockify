import { Component, OnDestroy, OnInit } from '@angular/core';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'tps-container-graph',
  templateUrl: './container-graph.component.html',
  styleUrls: ['./container-graph.component.scss']
})
export class ContainerGraphComponent implements OnInit, OnDestroy {

  public isRequesting = false;
  public isServerError = false;


  public systemInfo: any = {containers: 0};
  public containerGraphOptions: any = {};

  private subs = new SubSink();

  constructor(
    private dataService: DataService,
    private snackBarService: SnackBarService,
    private translatorService: TranslatorService,
    private customEventService: CustomEventService,
  ) {
    this.subs.add(
      this.customEventService.on('refresh-dashboard').subscribe(() => {
        this.loadData();
      })
    );
  }

  ngOnInit(): void {
    // this.loadData();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  public loadData(): void {
    this.isRequesting = true;
    this.isServerError = false;
    this.subs.add(
      this.dataService.GET_ANY<any>(`${'/docker/system-info'}`)
        .pipe(
          finalize(() => {
            this.isRequesting = false;
          }))
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            this.isRequesting = false;
            this.systemInfo = response.result;


            this.containerGraphOptions = this.getContainerGraphOptions();
            this.dataService.globalSystemInfo.next(response.result);
          }
          else {
            this.snackBarService.openErrorSnackBar(response.result);
          }
        }, (error) => {
          // server error (docker daemon or server)
          this.isServerError = true;
          this.snackBarService.openErrorSnackBar(
            this.translatorService.getTranslated('SYSTEM.SERVER_ERROR')
          );
        })
    );
  }

  public getContainerGraphOptions(): any {
    return {
      series: [
        {
          name: '',
          type: 'pie',
          radius: ['0', '75%'],
          color: ['#62b563', '#bb0000', '#ecc400'],
          avoidLabelOverlap: true,
          label: {
            show: true,
            formatter: '{b}'
          },
          data: [
            {
              value: this.systemInfo.containersRunning,
              name: `${this.translatorService.getTranslated('DASHBOARD.CONTAINER_RUNNING')}: ${this.systemInfo.containersRunning}`
            },
            {
              value: this.systemInfo.containersStopped,
              name: `${this.translatorService.getTranslated('DASHBOARD.CONTAINER_STOPPED')}: ${this.systemInfo.containersStopped}`
            },
            {
              value: this.systemInfo.containersPaused,
              name: `${this.translatorService.getTranslated('DASHBOARD.CONTAINER_PAUSED')}: ${this.systemInfo.containersPaused}`
            }
          ],
          itemStyle: {
            borderWidth: 2,
            borderColor: '#fff'
          }
        }
      ]
    };
  }

}
