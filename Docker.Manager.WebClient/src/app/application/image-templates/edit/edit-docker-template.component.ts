import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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

export interface IRecordState {
  state: string;
}

@Component({
  selector: 'tps-edit-docker-template',
  templateUrl: './edit-docker-template.component.html',
  styleUrls: ['./edit-docker-template.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [slideInOutAnimation],
  // tslint:disable-next-line: no-host-metadata-property
  host: { '[@slideInOutAnimation]': '' },
})
export class EditDockerTemplateComponent implements OnInit, OnDestroy {
  public dataFRM: FormGroup;

  public TITLE: string;
  public isRequesting: boolean;

  public tagType$: Observable<any>;
  public selectedGroup: any = [];
  public photoGalleryList: any = [];
  public networkList: any = [];

  public platformList$: Observable<any>;

  public dockerRegistryList: any = [];

  private progress: any;
  private state: string;
  private editMode: boolean;
  private subs = new SubSink();
  private recordId: string;
  // private tempPorts: string;
  // private tempBinds: string;

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
    this.editMode = false;
    this.recordId = null;

    this.createEmptyForm();

    this.recordId = this.route.snapshot.params.id;
    this.state = this.route.snapshot.params.state || null;

    switch (this.state) {
      case 'edit':
        this.editMode = true;
        this.getRecordById();
        break;
      case 'clone':
        this.editMode = false;
        this.getRecordById();
        break;
      default:
        this.editMode = false;
        break;
    }

    //  this.editMode = this.recordId === null || this.recordId === undefined ? false : true;

    this.TITLE = this.translatorService.getTranslated(
      this.editMode ? 'SYSTEM.RECORD.STATE_EDIT' : 'SYSTEM.RECORD.STATE_INSERT'
    );

    this.loadParameters();

    /*if (this.editMode) {
      this.getRecordById();
    }*/

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private createEmptyForm(): void {
    this.dataFRM = this.fb.group({
      id: Guid.newGuid(),
      templateTitle: [null, Validators.compose([Validators.required, Validators.maxLength(100)])],
      description: [null, Validators.compose([Validators.required, Validators.maxLength(200)])],
      logoURL: [null],
      publishAllPorts: true,
      platform: 1,
      ports: null,
      binds: null,
      startContainer: false,
      autoUpdate: true,
      env: null,
      entryPoint: null,
      cmd: null,
      isProtected: false,
      alwaysPullImage: false
    });
  }

  private loadParameters(): void {
    this.platformList$ = this.dataservice.getParametersByItem('PLATFORM');

  }

  public hasError = (controlName: string, errorName: string) => {
    return this.dataFRM.controls[controlName].hasError(errorName);
  }

  public async saveData(): Promise<any> {
    try {
      this.isRequesting = true;
      if (this.state === 'clone') {
        // need new id if cloning the template
        this.dataFRM.controls.id.setValue(Guid.newGuid());
      }

      const saveRequest: any = this.editMode ? this.dataservice
        .UPDATE<IErrorResponse>(`${'/app-template/put/'}${this.recordId}`, this.dataFRM.value)
        : this.dataservice.SAVE<IErrorResponse>(`${'/app-template/post'}`, this.dataFRM.value);

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

                this.router.navigate(['/app/image-template']);

                this.customEventService.publish('application-updated');

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

  private getRecordById(): void {
    const url = `${'/app-template/getById/'}${this.recordId}`;

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
