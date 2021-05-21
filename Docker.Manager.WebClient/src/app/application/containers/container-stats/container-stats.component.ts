import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IContainerStat } from '@app/application/interfaces/container-stat.interface';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { DataService } from '@app/shared/services/data-servcie';
import { SignalRService } from '@app/shared/services/signalr.service';
import { SubSink } from '@app/shared/subsink';

@Component({
  selector: 'tps-container-stats',
  templateUrl: './container-stats.component.html',
  styleUrls: ['./container-stats.component.scss'],
})
export class ContainerStatsComponent implements OnInit, OnDestroy {
  public imageName: string;
  public containerName: string;
  public id: string;
  public status: string;

  public stats: IContainerStat = {
    cpuUsage: 0, diskRead: 0, diskWrite: 0, id: '', isRunning: true, memoryUsage: 0, networkIO: [0, 0]
  };

  private subs = new SubSink();

  constructor(
    public dialogRef: MatDialogRef<ContainerStatsComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private dataservice: DataService,
    private signalRService: SignalRService,
    private customEventService: CustomEventService
  ) {
    this.imageName = data.imageName;
    this.containerName = data.containerName;
    this.id = data.id;
  }

  ngOnInit(): void {
    this.subs.add(
      this.customEventService.on('container-stat-update')
        .subscribe(() => {
          this.handleContainerStat();
        })
    );


    this.subs.add(this.dataservice.GET_ANY<boolean>(`${'/docker/get-container-stats'}/${this.id}`)
      .subscribe((response: IDockerHubResponse) => {
        if (response.success) {
        } else {
          // TODO: HANDLE DOCKERAPIEXCEPTION ERROR
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  public onClose(status: boolean): void {
    this.dialogRef.close();
  }

  public handleContainerStat(): void {
    this.stats = this.signalRService.getContainerStats;
    if (!this.stats) {
      return;
    }

    if (this.stats.id === this.id) {
    }
  }
}
