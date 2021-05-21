
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Guid, MyConstants } from '@app/shared/constants/constants';
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
  selector: 'tps-edit-tenant',
  templateUrl: './edit-tenant.component.html',
  styleUrls: ['./edit-tenant.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [slideInOutAnimation],
  // tslint:disable-next-line: no-host-metadata-property
  host: { '[@slideInOutAnimation]': '' },
})
export class EditTenantComponent implements OnInit, OnDestroy {
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

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
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder,

    private dialogModel: MatDialog,
    private dataservice: DataService,
    private snackBarService: SnackBarService,
    private translatorService: TranslatorService,
    private customEventService: CustomEventService
  ) { }

  ngOnInit(): void {
    this.createEmptyForm();

    this.recordId = this.route.snapshot.params.id;
    this.editMode = this.recordId === null || this.recordId === undefined ? false : true;

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

      const saveRequest: any = this.editMode
        ? this.dataservice.UPDATE<IErrorResponse>(`${'/company/put/'}${this.recordId}`, this.dataFRM.value)
        : this.dataservice.SAVE<IErrorResponse>(`${'/company/post'}`, this.dataFRM.value);

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

                this.router.navigate(['/app/tenants']);

                this.customEventService.publish('tenants-updated');

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

  private createEmptyForm(): void {
    this.dataFRM = this.fb.group({
      id: Guid.newGuid(),
      name: [null, Validators.compose([Validators.required, Validators.maxLength(200)])],
      dnsName: [null, Validators.compose([Validators.maxLength(200)])],
      domainName: [null, Validators.compose([Validators.maxLength(200)])],
      hostName: [null, Validators.compose([Validators.maxLength(200)])],
      dataBase: [null, Validators.compose([Validators.maxLength(50)])],
      environment: null,
      telephoneNo: [null, Validators.compose([Validators.maxLength(20)])],
      contactPerson: [null, Validators.compose([Validators.maxLength(500)])],
      emailAddress: [null, Validators.compose([Validators.pattern(MyConstants.EMAIL_PATTERN)])]
    });
  }

  private getRecordById(): void {
    const url = `${'/company/getById/'}${this.recordId}`;
    const groupList: any = [];

    this.subs.add(
      this.dataservice.GET_ANY<IRequestData>(url).subscribe((results: any) => {

        this.dataFRM.patchValue(results);

       // const env: any = results.environment.split(',');
      //  this.dataFRM.controls.environment.setValue(env);

      })
    );

  }

  public onRemoving(tag): Observable<any> {
    const confirm = window.confirm(
      this.translatorService.getTranslated('SYSTEM.RECORD.ARE_YOU_SURE')
    );
    return of(tag).pipe(filter(() => confirm));
  }

  public searchForImage(): void {
    if (
      this.dataFRM.controls.imageName.value === null ||
      this.dataFRM.controls.imageName.value === undefined
    ) {
      return;
    }
  }

}
