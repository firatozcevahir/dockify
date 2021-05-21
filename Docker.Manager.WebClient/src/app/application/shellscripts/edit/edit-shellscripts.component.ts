
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
  selector: 'tps-edit-shellscripts',
  templateUrl: './edit-shellscripts.component.html',
  styleUrls: ['./edit-shellscripts.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [slideInOutAnimation],
  // tslint:disable-next-line: no-host-metadata-property
  host: { '[@slideInOutAnimation]': '' },
})
export class EditShellscriptsComponent implements OnInit, OnDestroy {
  public dataFRM: FormGroup;

  public TITLE: string;
  public isRequesting: boolean;

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

  private createEmptyForm(): void {
    this.dataFRM = this.fb.group({
      id: Guid.newGuid(),
      name: [null, Validators.compose([Validators.required, Validators.maxLength(100)])],
      content: [null,Validators.required]
    });
  }

  private getRecordById(): void {
    const url = `${'/shell-script/getById/'}${this.recordId}`;

    this.subs.add(
      this.dataservice.GET_ANY<IRequestData>(url).subscribe((results: any) => {
        console.log(results);
        this.dataFRM.patchValue(results);
        this.dataFRM.markAsPristine();
      })
    );
  }

  public async saveData() {
    try {
      this.isRequesting = true;

      const saveRequest: any = this.editMode
        ? this.dataservice.UPDATE<IErrorResponse>(`${'/shell-script/put/'}${this.recordId}`, this.dataFRM.value)
        : this.dataservice.SAVE<IErrorResponse>(`${'/shell-script/post'}`, this.dataFRM.value
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

                this.router.navigate(['/app/shell-scripts']);

                this.customEventService.publish('shellscript-updated');

                this.snackBarService.openSuccessSnackBar(
                  this.translatorService.getTranslated('SYSTEM.RECORD.PROCESS_COMPLETED')
                );
              } else {
                this.snackBarService.openErrorSnackBar(results.message);
              }
            },
            (error) => {
              // server error (docker daemon or server)
              this.snackBarService.openErrorSnackBar(
                this.translatorService.getTranslated('SYSTEM.SERVER_ERROR')
              );
            }
          )
      );
    } catch (error) { }
  }
}
