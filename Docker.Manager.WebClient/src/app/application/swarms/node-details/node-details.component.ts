import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IRequestData } from '@app/shared/interfaces/IRequestData';
import { DataService } from '@app/shared/services/data-servcie';
import { SubSink } from '@app/shared/subsink';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { SnackBarService } from '@app/shared/services/snack-bar.service';

@Component({
  selector: 'tps-node-details',
  templateUrl: './node-details.component.html',
  styleUrls: ['./node-details.component.scss']

})
export class NodeDetailsComponent implements OnInit, OnDestroy {
  public config: any;
  public title: string;
  public resultData: any;

  private record: any;
  public name: string;
  private url: string;
  private subs = new SubSink();

  constructor(
    public dialogRef: MatDialogRef<NodeDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private dataservice: DataService,
    private snackBarService: SnackBarService
  ) {
    this.record = data.record;

    this.name = this.record.names ? this.record.names[0].substr(1, this.record.names[0].length) : '';
    this.title = data.title;
    this.url = data.url;
  }

  ngOnInit(): void {
    this.subs.add(
      this.dataservice
        .GET_ANY<IRequestData>(`${this.url}${this.record.id}`)
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            this.resultData = response.result;
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
