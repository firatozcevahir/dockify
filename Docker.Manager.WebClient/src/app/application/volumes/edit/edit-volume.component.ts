
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'tps-edit-volume',
  templateUrl: './edit-volume.component.html',
  styleUrls: ['./edit-volume.component.scss'],

  encapsulation: ViewEncapsulation.None,
  animations: [slideInOutAnimation],
  // tslint:disable-next-line: no-host-metadata-property
  host: { '[@slideInOutAnimation]': '' },
})
export class EditVolumeComponent implements OnInit, OnDestroy {
  public dataFRM: FormGroup;

  public TITLE: string;
  public isRequesting: boolean;

  public driversList$: Observable<any>;

  private subs = new SubSink();
  private recordId: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder,

    private dataservice: DataService,
    private snackBarService: SnackBarService,
    private translatorService: TranslatorService,
    private customEventService: CustomEventService
  ) { }

  ngOnInit(): void {
    this.createEmptyForm();
    this.loadParameters();

    this.TITLE = this.translatorService.getTranslated('SYSTEM.RECORD.STATE_INSERT');

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private createEmptyForm(): void {
    this.dataFRM = this.fb.group({
      name: [null, Validators.compose([Validators.required, Validators.maxLength(100)])],
      driver: ['local', Validators.compose([Validators.required, Validators.maxLength(100)])],
      driverOpts: null,
      labels: null
    });
  }


  private loadParameters(): void {
    this.driversList$ = this.dataservice.getParametersByItem('VOLUME_DRIVERS');
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.dataFRM.controls[controlName].hasError(errorName);
  }

  // tslint:disable-next-line: typedef
  public async saveData() {
    try {
      this.isRequesting = true;

      this.subs.add(
        this.dataservice.SAVE<IErrorResponse>(`${'/docker/create-volume'}`, this.dataFRM.value
        )
          .pipe(
            finalize(() => {
              this.isRequesting = false;
            })
          )
          .subscribe(
            (results: any) => {
              if (results) {
                this.isRequesting = false;

                this.router.navigate(['/app/docker-volumes']);

                this.customEventService.publish('volume-updated');

                this.snackBarService.openSuccessSnackBar(
                  this.translatorService.getTranslated(
                    'SYSTEM.RECORD.PROCESS_COMPLETED'
                  )
                );
              } else {
                this.snackBarService.openErrorSnackBar(results.message);
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
