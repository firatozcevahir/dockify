import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { TaskState } from '@app/application/interfaces/docker-task.interface';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'tps-list-tasks',
  templateUrl: './list-tasks.component.html',
  styleUrls: ['./list-tasks.component.scss']
})
export class ListTasksComponent implements OnInit, OnDestroy {
  public title: string;
  private record: any;
  private url: string;
  private subs = new SubSink();

  public isRequesting: boolean;

  public dataFRM: FormGroup;

  private taskState = TaskState;
  private taskRefreshInterval: NodeJS.Timeout;

  public dataSource = new MatTableDataSource<any>();
  public dataResult: any[] = [];
  public displayedColumns: string[] = ['status', 'id', 'slot', 'nodeID', 'updatedAt'];

  constructor(
    public dialogRef: MatDialogRef<ListTasksComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private fb: FormBuilder,
    private dataservice: DataService,
    private snackBarService: SnackBarService,
    private translatorService: TranslatorService
  ) {
    this.record = data.record;
    this.title = data.title;
    this.url = data.url;
  }

  ngOnInit(): void {
    this.loadData();
    this.createEmptyForm();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  public onClose(): void {
    this.dialogRef.close();
  }

  private createEmptyForm(): void {
    this.dataFRM = this.fb.group({
      id: this.record.id,
      replicas: [this.dataResult.length, Validators.compose([Validators.required])]
    });
  }

  public loadData(): void {
    this.subs.add(
      this.dataservice
        .GET_ANY<IDockerHubResponse>(`${this.url}${this.record.id}`)
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {

            this.dataSource = new MatTableDataSource<any>(response.result);
            this.dataResult = response.result;

            if (this.dataResult.filter((e) => e.status.state !== this.taskState.Running).length < 1) {
              // IF EVERY SERVICE IS RUNNING
            }
          } else {

            this.snackBarService.openErrorSnackBar(response.result);
          }
        })
    );
  }

  public getStateName(state: TaskState): string {
    return this.taskState[state].toUpperCase();
  }

  public updateReplicas(): void {
    try {
      this.isRequesting = true;

      this.subs.add(
        this.dataservice
          .SAVE<IDockerHubResponse>(`${'/docker/update-service-replicas'}`, this.dataFRM.value)
          .pipe(
            finalize(() => {
              this.isRequesting = false;
            })
          )
          .subscribe(
            (response: IDockerHubResponse) => {
              if (response.success) {

                this.isRequesting = false;
                this.snackBarService.openSuccessSnackBar(
                  this.translatorService.getTranslated('SYSTEM.RECORD.PROCESS_COMPLETED')
                );

                this.loadData();

              } else {
                this.snackBarService.openErrorSnackBar(response.result);
              }
            },
            (error) => {
              this.isRequesting = false;
            }
          )
      );
    } catch (error) { }
  }
}
