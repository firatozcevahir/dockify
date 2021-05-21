import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IRequestData } from '@app/shared/interfaces/IRequestData';
import { DataService } from '@app/shared/services/data-servcie';
import { SubSink } from '@app/shared/subsink';

@Component({
  selector: 'tps-inspect-swarm',
  templateUrl: './inspect-swarm.component.html',
  styleUrls: ['./inspect-swarm.component.scss']
})
export class InspectSwarmComponent implements OnInit, OnDestroy {

  public resultData: any;

  public managerToken: string;
  public workerToken: string;

  private url: string;
  private subs = new SubSink();

  constructor(
    public dialogRef: MatDialogRef<InspectSwarmComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private dataservice: DataService
  ) {
    this.url = data.url;
  }

  ngOnInit(): void {
    this.subs.add(
      this.dataservice
        .GET_ANY<IRequestData>(this.url)
        .subscribe((response: any) => {
          if (response.success) {
            this.resultData = response.result;
            this.managerToken = this.resultData.joinTokens.manager;
            this.workerToken = this.resultData.joinTokens.worker;
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
