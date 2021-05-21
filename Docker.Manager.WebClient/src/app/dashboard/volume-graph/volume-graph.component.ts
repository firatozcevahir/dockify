import { Component, OnDestroy, OnInit } from '@angular/core';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { IVolume } from '@app/application/interfaces/docker-volume.interface';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'tps-volume-graph',
  templateUrl: './volume-graph.component.html',
  styleUrls: ['./volume-graph.component.scss']
})
export class VolumeGraphComponent implements OnInit, OnDestroy {

  public isRequesting = false;
  public isServerError = false;
  public volumeGraphOptions: any = {};

  public systemInfo: any = { containers: 0 };
  public volumes: IVolume[] = [];

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
      this.dataService
        .GET_ANY<IVolume>(`${'/docker/list-volume'}`)
        .pipe(
          finalize(() => {
            this.isRequesting = false;
          }))
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            this.volumes = response.result.volumes;
            this.volumeGraphOptions = this.getVolumeGraphOptions();
          } else {
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

  public getVolumeGraphOptions(): any {
    return {
      series: [
        {
          name: '',
          type: 'pie',
          radius: ['0', '75%'],
          avoidLabelOverlap: true,
          data: this.volumes.map(v => {
            return {
              value: v.usageData?.size || 0,
              name: `${v.name}`,
            };
          }),
          itemStyle: {
            color: '#1a93ab',
            borderWidth: 2,
            borderColor: '#fff'
          }
        }
      ]
    };
  }
}
