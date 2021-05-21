import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialogRef } from '@angular/material/dialog';
import { IErrorResponse } from '@app/shared/interfaces/IErrorResponse';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'tps-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  public dataFRM: FormGroup;
  public isRequesting: boolean;
  private subs = new SubSink();
  matcher = new MyErrorStateMatcher();

  constructor(
    public dialogRef: MatDialogRef<ChangePasswordComponent>,
    private dataservice: DataService,
    private translatorService: TranslatorService,
    private snackBarService: SnackBarService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.createEmptyForm();
  }

  private createEmptyForm(): void {
    this.dataFRM = this.fb.group({
      password: ['', Validators.required],
      newPassword: ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(25)])],
      newPasswordVerify: ['', Validators.required],
    }, { validator: [this.checkPasswords, this.isNotOldPasswords] });
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.dataFRM.controls[controlName].hasError(errorName);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  public async saveData(): Promise<void> {
    try {
      this.isRequesting = true;
      const saveRequest: any = this.dataservice.SAVE<IErrorResponse>(`${'/account/change-password'}`, this.dataFRM.value);

      this.subs.add(

        saveRequest
          .pipe(
            finalize(() => {
              this.isRequesting = false;
            })
          )
          .subscribe((results: any) => {
            // console.log(results);
            if (results) {

              this.isRequesting = false;
              this.snackBarService.openSuccessSnackBar(this.translatorService.getTranslated('SYSTEM.RECORD.PROCESS_COMPLETED'));
              this.onClose();

            } else {
              this.snackBarService.openErrorSnackBar(this.translatorService.getTranslated('SYSTEM.RECORD.PROCESS_FAILED'));
            }
          },
            (error) => {
              this.isRequesting = false;
            })

      );

    } catch (error) { }

  }

  checkPasswords(group: FormGroup): { notSame: boolean } {
    const pass = group.controls.newPassword.value;
    const confirmPass = group.controls.newPasswordVerify.value;

    return pass === confirmPass ? null : { notSame: true };
  }

  isNotOldPasswords(group: FormGroup): { isSameOldPassword: boolean } {
    const pass = group.controls.password.value;
    const newPass = group.controls.newPassword.value;

    return pass !== newPass ? null : { isSameOldPassword: true };
  }
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
    const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);

    return (invalidCtrl || invalidParent);
  }
}
