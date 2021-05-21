import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from '@app/shared/services/data-servcie';
import { SubSink } from '@app/shared/subsink';
import { IDockerImages } from '@app/application/interfaces/docker-images.interface';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { IImageProgress } from '@app/application/interfaces/image-progress.interface';
import { SignalRService } from '@app/shared/services/signalr.service';
import { IDockerRegistry } from '@app/application/interfaces/docker-registry.interface';
import { IRequestData } from '@app/shared/interfaces/IRequestData';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { SnackBarService } from '@app/shared/services/snack-bar.service';

@Component({
  selector: 'tps-push-to-registry',
  templateUrl: './push-to-registry.component.html',
  styleUrls: ['./push-to-registry.component.scss']
})
export class PushToRegistryComponent implements OnInit {
  public pushFRM: FormGroup;

  public record: IDockerImages;
  public isRequesting: boolean;

  public dockerRegistryList: any = [];
  private subs = new SubSink();

  public imagePushProgressData: IImageProgress;

  constructor(
    public dialogRef: MatDialogRef<PushToRegistryComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private dataservice: DataService,
    private fb: FormBuilder,
    private customEventService: CustomEventService,
    private signalRService: SignalRService,
    private snackBarService: SnackBarService
  ) {
    this.record = data.record as IDockerImages;
  }

  ngOnInit(): void {
    this.createPushForm();
    this.loadParameters();
    this.subs.add(this.customEventService.on('image-push-progress-update')
      .subscribe(() => {
        this.handleImageProgressData();
      }));
  }

  public onClose(): void {
    this.dialogRef.close();
  }

  private loadParameters(): void {
    this.subs.add(
      this.dataservice
        .GET_ANY<IDockerRegistry>(`${'/registry/list-registry'}`)
        .subscribe((results: IRequestData) => {
          this.dockerRegistryList = results.items;
          this.pushFRM.controls.fromSrc.setValue(this.dockerRegistryList[0]);
        })
    );
  }

  private createPushForm(): void {
    this.pushFRM = this.fb.group({
      id: [this.record.id],
      repoName: [null, Validators.compose([Validators.required, Validators.maxLength(100)])],
      tag: [null, Validators.compose([Validators.required, Validators.maxLength(100)])],
      fromSrc: null
    });
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.pushFRM.controls[controlName].hasError(errorName);
  }

  public saveData(): void {
    this.isRequesting = true;
    this.dataservice.SAVE<boolean>(
      `${'/docker/tag-image'}`,
      this.pushFRM.value
    )
      .pipe(
        finalize(() => {
          this.isRequesting = true;
        })
      )
      .subscribe(
        (response: IDockerHubResponse) => {
          if (response.success) {
            this.dataservice.SAVE<boolean>(
              `${'/docker/push-image'}`,
              this.pushFRM.value
            ).pipe(
              finalize(() => {
                this.isRequesting = true;
              })
            )
              .subscribe(
                (res: IDockerHubResponse) => {
                  if (res.success) {
                    this.isRequesting = true;
                  } else {
                    this.isRequesting = false;
                    this.snackBarService.openErrorSnackBar(response.result);
                  }
                }
              );
          } else {
            this.isRequesting = false;
            this.snackBarService.openErrorSnackBar(response.result);
          }
        });
  }

  public handleImageProgressData(): void {
    this.imagePushProgressData = this.signalRService.getImagePushProgressData;
  }
}
