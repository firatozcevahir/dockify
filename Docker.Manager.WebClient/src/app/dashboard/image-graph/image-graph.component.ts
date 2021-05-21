import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { IDockerImages } from '@app/application/interfaces/docker-images.interface';
import { IVolume } from '@app/application/interfaces/docker-volume.interface';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'tps-image-graph',
  templateUrl: './image-graph.component.html',
  styleUrls: ['./image-graph.component.scss']
})
export class ImageGraphComponent implements OnInit, OnDestroy {

  @Input() public showTitle = true;
  @Input() public showGraph = true;

  public isRequesting = false;
  public isServerError = false;

  public systemInfo: any = { containers: 0 };
  public images: IDockerImages[] = [];

  public imageGraphOptions: any = {};

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
        .GET_ANY<IVolume>(`${'/docker/list-images'}`)
        .pipe(
          finalize(() => {
            this.isRequesting = false;
          }))
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            this.images = response.result;
            this.imageGraphOptions = this.getImageGraphOptions();
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

  public getTotalImageSize(): number {
    return this.images.reduce((a, b) => a + b.size, 0) || 0;
  }

  public formatBytes(bytes, decimals = 0): string {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  public getImageGraphOptions(): any {
    return {
      tooltip: {
        trigger: 'item',
        formatter: (a) => {
          return `<b>${a.name}</b><br />${this.formatBytes(a.value, 2)} ${a.percent}%`;
        }
      },
      series: [
        {
          name: '',
          type: 'pie',
          radius: ['0', '75%'],
          avoidLabelOverlap: true,
          data: this.images.map((img) => {
            return {
              value: img.size,
              name: `${img.repoTags}`
            };
          }),
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2
          }
        }
      ]
    };
  }
}
