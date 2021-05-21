import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { SubSink } from '@app/shared/subsink';

const ansiHTML = require('ansi-html');

@Component({
  selector: 'tps-container-logs',
  templateUrl: './container-logs.component.html',
  styleUrls: ['./container-logs.component.scss']
})

export class ContainerLogsComponent implements OnInit, OnDestroy {
  public imageName: string;
  public containerName: string;
  public id: string;
  public containerLog: string;
  // public containerLogs: string[] = [];
  public isRequesting = false;

  public autoRefreshLogs: boolean;
  public intervalTimer: number;
  private checkInterval: any = null;

  @ViewChild('target') private myScrollContainer: ElementRef;

  private subs = new SubSink();

  constructor(
    public dialogRef: MatDialogRef<ContainerLogsComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private dataservice: DataService,
    private snackbarService: SnackBarService
  ) {
    this.imageName = data.imageName;
    this.containerName = data.containerName;
    this.id = data.id;
    this.autoRefreshLogs = false;
    this.intervalTimer = 5000;
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scroll({
        top: this.myScrollContainer.nativeElement.scrollHeight,
        left: 0,
        behavior: 'smooth'
      });
      // this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { console.log(err); }
  }

  ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {

    this.isRequesting = true;
    this.subs.add(this.dataservice.GET_ANY<IDockerHubResponse>(`${'/docker/get-container-logs'}/${this.id}`)
      .subscribe((response: IDockerHubResponse) => {
        if (response.success) {
          this.isRequesting = false;
          this.containerLog = ansiHTML(response.result);
          setTimeout(() => { this.scrollToBottom(); }, 200);
        } else {
          this.snackbarService.openErrorSnackBar(response.result);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.checkInterval) { clearInterval(this.checkInterval); }
  }

  public onClose(status: boolean): void {
    this.dialogRef.close();
  }

  public toggleAutoRefreshLogs($event: boolean): void {
    if ($event) {
      this.checkInterval = setInterval(() => {
        this.loadData();
      }, this.intervalTimer);
    } else {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}
