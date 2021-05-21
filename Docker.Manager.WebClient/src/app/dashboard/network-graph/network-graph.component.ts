import { Component, OnDestroy, OnInit } from '@angular/core';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { IDockerNetwork } from '@app/application/interfaces/docker-network.interface';
import { IVolume } from '@app/application/interfaces/docker-volume.interface';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'tps-network-graph',
  templateUrl: './network-graph.component.html',
  styleUrls: ['./network-graph.component.scss']
})
export class NetworkGraphComponent implements OnInit, OnDestroy {

  public isRequesting = false;
  public isServerError = false;

  public volumeGraphOptions: any = {};

  public systemInfo: any = { containers: 0 };

  public networks: IDockerNetwork[] = [];
  public networkGraphOptions: any = {};

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
        .GET_ANY<IVolume>(`${'/docker/list-networks'}`)
        .pipe(
          finalize(() => {
            this.isRequesting = false;
          }))
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            this.networks = response.result;
            this.networkGraphOptions = this.getNetworkGraphOptions();
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

  public getNetworkGraphOptions(): any {
    return {
      series: [
        {
          name: '',
          type: 'pie',
          radius: ['0', '75%'],
          avoidLabelOverlap: true,
          data: this.networks.map(a => {
            return {
              value: 1,
              name: `${a.name}`,
            };
          }),
          itemStyle: {
            borderWidth: 2,
            borderColor: '#fff'
          }
        }
      ]
    };
  }
}
