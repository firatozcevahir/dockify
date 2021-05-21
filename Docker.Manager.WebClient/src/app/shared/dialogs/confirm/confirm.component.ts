import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { ConfirmDialogType, ConfirmServiceType, IConfirmDialogResult } from '@app/shared/interfaces/IConfirmDialogResult.interface';
import { DataService } from '@app/shared/services/data-servcie';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'tps-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmComponent implements OnInit, OnDestroy {

  public isRequesting = false;

  public serviceType = ConfirmServiceType;
  public dataFRM: FormGroup;

  private subs = new SubSink();
  private baseService: string;

  constructor(
    private dialogRef: MatDialogRef<ConfirmComponent>, @Inject(MAT_DIALOG_DATA)
    public data: ModalConfirmData,
    private dataservice: DataService,
    private translatorService: TranslatorService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.createDefaultForm();
    this.baseService = this.handleBaseService();

    this.subs.add(
      this.dataFRM.valueChanges.subscribe(() => {
        this.baseService = this.handleBaseService();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }


  pruneOperationConfirm(): void {
    this.isRequesting = true;
    this.subs.add(
      this.dataservice
        .GET_ANY<any>(`${this.baseService}`)
        .pipe(
          finalize(() => {
          })
        )
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            this.isRequesting = false;
            this.dialogRef.close(this.getConfirmDialogResult(ConfirmDialogType.OperationSuccess, response.result));
          } else {
            this.dialogRef.close(this.getConfirmDialogResult(ConfirmDialogType.OperationFailed, response.result));
          }
        })
    );
  }

  public cancelOperation(): void {
    this.dialogRef.close(this.getConfirmDialogResult(ConfirmDialogType.Canceled, this.translatorService.getTranslated('SYSTEM.RECORD.OPERATION_CANCELED')));
  }

  private getConfirmDialogResult(type: ConfirmDialogType, message: any): IConfirmDialogResult {
    return {
      type,
      message
    };
  }
  private handleBaseService(): string {
    switch (this.data.type) {
      case ConfirmServiceType.PruneContainer:
        return `/docker/prune-container/${this.dataFRM.controls.includeProtected.value}`;
      case ConfirmServiceType.PruneVolume:
        return `/docker/prune-volume`;
      case ConfirmServiceType.PruneImage:
        return `/docker/prune-images`;
      case ConfirmServiceType.PruneNetwork:
        return `/docker/prune-network`;
      default:
        return '';
    }
  }

  private createDefaultForm(): void {
    this.dataFRM = this.fb.group({
      includeProtected: [false]
    });
  }
}

export class ModalConfirmData {
  title: string;
  message: string;
  type: ConfirmServiceType;
  service: string;
  confirmButtonLabel: string;
  closeButtonLabel: string;

  constructor(data?) {
    if (data) {
      this.title = data.title;
      this.message = data.message;
      this.type = data.type;
      this.service = data.service;
    }
  }
}
