import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from '@app/shared/services/data-servcie';
import { SubSink } from '@app/shared/subsink';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { SnackBarService } from '@app/shared/services/snack-bar.service';

@Component({
  selector: 'tps-docker-detail',
  templateUrl: './docker-detail.component.html',
  styleUrls: ['./docker-detail.component.scss'],
})
export class DockerDetailComponent implements OnInit, OnDestroy {

  public isRequesting = false;
  public config: any;
  public title: string;
  public resultData: any;

  private record: any;
  public containerName: string;
  private url: string;
  private subs = new SubSink();

  constructor(
    public dialogRef: MatDialogRef<DockerDetailComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private dataservice: DataService,
    private snackBarService: SnackBarService
  ) {
    this.record = data.record;

    this.containerName = this.record.names ? this.record.names[0].substr(1, this.record.names[0].length) : '';
    this.title = data.title;
    this.url = data.url;
  }

  ngOnInit(): void {
    this.isRequesting = true;
    this.subs.add(
      this.dataservice
        .GET_ANY<IDockerHubResponse>(`${this.url}${this.record.id || this.record.name}`)
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            this.resultData = response.result;
            this.isRequesting = false;
          } else {
            this.snackBarService.openErrorSnackBar(response.result);
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  public onClose(): void {
    this.dialogRef.close();
  }
}
