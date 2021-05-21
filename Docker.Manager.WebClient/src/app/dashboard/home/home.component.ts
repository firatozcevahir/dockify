import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { IDockerImages } from '@app/application/interfaces/docker-images.interface';
import { IDockerNetwork } from '@app/application/interfaces/docker-network.interface';
import { IVolume } from '@app/application/interfaces/docker-volume.interface';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink';

@Component({
  selector: 'tps-dashboard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  @Input() public showTitle = true;
  @Input() public showGraph = true;

  private subs = new SubSink();
  public systemInfo: any = { containers: 0 };
  public volumes: IVolume[] = [];
  public images: IDockerImages[] = [];
  public networks: IDockerNetwork[] = [];

  public containerGraphOptions: any = {};
  public imageGraphOptions: any = {};
  public networkGraphOptions: any = {};
  public volumeGraphOptions: any = {};

  constructor(
    private dataService: DataService,
    private snackBarService: SnackBarService,
    private translatorService: TranslatorService,
    private customEventService: CustomEventService,
  ) { }

  ngOnInit(): void {

    this.loadSystemInfo();

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  public loadSystemInfo(): void {

    this.customEventService.publish('refresh-dashboard');

    this.subs.add(
      this.dataService.GET_ANY<any>(`${'/docker/system-info'}`)
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            this.systemInfo = response.result;
            this.dataService.globalSystemInfo.next(response.result);
          }
          else {
            this.snackBarService.openErrorSnackBar(response.result);
          }
        })
    );

  }

}
