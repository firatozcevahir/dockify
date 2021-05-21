
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { IErrorResponse } from '@app/shared/interfaces/IErrorResponse';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink/index';
import { slideInOutAnimation } from '@app/shared/_animations';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'tps-join-swarm',
  templateUrl: './join-swarm.component.html',
  styleUrls: ['./join-swarm.component.scss'],

  encapsulation: ViewEncapsulation.None,
  animations: [slideInOutAnimation],
  // tslint:disable-next-line: no-host-metadata-property
  host: { '[@slideInOutAnimation]': '' },
})
export class JoinSwarmComponent implements OnInit, OnDestroy {
  public dataFRM: FormGroup;

  public groupList$: Observable<any>;
  public TITLE: string;
  public isRequesting: boolean;

  private subs = new SubSink();

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialogModel: MatDialog,
    private dataservice: DataService,
    private snackBarService: SnackBarService,

    private translatorService: TranslatorService,
    private customEventService: CustomEventService
  ) { }

  ngOnInit(): void {
    this.createEmptyForm();

    this.TITLE = this.translatorService.getTranslated('SYSTEM.RECORD.STATE_INSERT');

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private createEmptyForm(): void {
    this.dataFRM = this.fb.group({
      advertiseAddr: [null, Validators.compose([Validators.required, Validators.maxLength(50)])],
      listenAddr: [null, Validators.compose([Validators.maxLength(50)])],
      remoteAddrs: null,
      dataPathAddr: null,
      joinToken: null
    });
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.dataFRM.controls[controlName].hasError(errorName);
  }

  // tslint:disable-next-line: typedef
  public async saveData() {
    try {
      this.isRequesting = true;

      this.subs.add(
        this.dataservice
          .SAVE<IErrorResponse>(`${'/docker/join-swarm'}`, this.dataFRM.value)
          .pipe(
            finalize(() => {
              this.isRequesting = false;
            })
          )
          .subscribe(
            (response: IDockerHubResponse) => {

              if (response.success) {
                this.isRequesting = false;

                this.customEventService.publish('swarm-updated');
                this.router.navigate(['/app/swarm']);

                this.snackBarService.openSuccessSnackBar(
                  this.translatorService.getTranslated('SYSTEM.RECORD.PROCESS_COMPLETED')
                );
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

  public handleToggle(event: any): void {
    // console.log(this.dataFRM.controls.createContainer);
    // alert(event.checked);
  }
}
