
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Guid } from '@app/shared/constants/constants';
import { IErrorResponse } from '@app/shared/interfaces/IErrorResponse';
import { IRequestData } from '@app/shared/interfaces/IRequestData';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink/index';
import { slideInOutAnimation } from '@app/shared/_animations';
import { Observable, of } from 'rxjs';
import { filter, finalize } from 'rxjs/operators';

@Component({
  selector: 'tps-edit-setting',
  templateUrl: './edit-setting.component.html',
  styleUrls: ['./edit-setting.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [slideInOutAnimation],
  // tslint:disable-next-line: no-host-metadata-property
  host: { '[@slideInOutAnimation]': '' },
})
export class EditSettingComponent implements OnInit, OnDestroy {
  public dataFRM: FormGroup;

  public groupList$: Observable<any>;
  public TITLE: string;
  public isRequesting: boolean;

  public tagType$: Observable<any>;
  public selectedGroup: any = [];
  public photoGalleryList: any = [];
  public networkList: any = [];

  public platformList$: Observable<any>;
  public restartPolicy$: Observable<any>;

  private progress: any;
  private editMode: boolean;
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

    this.recordId = this.route.snapshot.params.id;
    this.editMode =
      this.recordId === null || this.recordId === undefined ? false : true;

    this.TITLE = this.translatorService.getTranslated(
      this.editMode ? 'SYSTEM.RECORD.STATE_EDIT' : 'SYSTEM.RECORD.STATE_INSERT'
    );

    if (this.editMode) {
      this.getRecordById();
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }


  public hasError = (controlName: string, errorName: string) => {
    return this.dataFRM.controls[controlName].hasError(errorName);
  }

  // tslint:disable-next-line: typedef
  public async saveData() {
    try {
      this.isRequesting = true;

      if (!this.dataFRM.controls.authenticationRequired.value){
        this.dataFRM.controls.userName.setValue(null);
        this.dataFRM.controls.password.setValue(null);
        this.dataFRM.controls.personalAccessToken.setValue(null);
      }

      const saveRequest: any = this.editMode
        ? this.dataservice.UPDATE<IErrorResponse>(`${'/registry/put/'}${this.recordId}`, this.dataFRM.value)
        : this.dataservice.SAVE<IErrorResponse>(`${'/registry/post'}`, this.dataFRM.value
        );

      this.subs.add(
        saveRequest
          .pipe(
            finalize(() => {
              this.isRequesting = false;
            })
          )
          .subscribe(
            (results: any) => {
              if (results.success) {
                this.isRequesting = false;

                this.router.navigate(['/app/settings']);

                this.customEventService.publish('registry-updated');

                this.snackBarService.openSuccessSnackBar(
                  this.translatorService.getTranslated('SYSTEM.RECORD.PROCESS_COMPLETED')
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


  private createEmptyForm(): void {
    this.dataFRM = this.fb.group({
      id: Guid.newGuid(),
      name: [null, Validators.compose([Validators.required, Validators.maxLength(100)])],
      registryUrl: [null, Validators.compose([Validators.required, Validators.maxLength(200)])],
      authenticationRequired: false,
      userName: [null, Validators.compose([Validators.maxLength(200)])],
      password: [null, Validators.compose([Validators.maxLength(200)])],
      personalAccessToken: [null, Validators.compose([Validators.maxLength(200)])]
    });
  }

  private getRecordById(): void {
    const url = `${'/registry/getById/'}${this.recordId}`;
    const groupList: any = [];

    this.subs.add(
      this.dataservice.GET_ANY<IRequestData>(url).subscribe((results: any) => {
        this.dataFRM.patchValue(results);
      })
    );
  }

  public onRemoving(tag): Observable<any> {
    const confirm = window.confirm(
      this.translatorService.getTranslated('SYSTEM.RECORD.ARE_YOU_SURE')
    );
    return of(tag).pipe(filter(() => confirm));
  }


}
