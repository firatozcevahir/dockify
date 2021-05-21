import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@app/shared/services/auth/authentication.service';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'tps-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit, OnDestroy {
  public loginForm: FormGroup = new FormGroup({});
  public passwordType: string;
  public passwordIcon: string;
  public isRequesting: boolean;
  public hide: boolean;
  public errorMessageAlertMsg: string;

  private loginSubscription: Subscription;
  private returnUrl: string;

  private subs = new SubSink();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthenticationService,
    private snackBar: SnackBarService,
    private translatorService: TranslatorService
  ) {
    this.isRequesting = false;
    if (this.auth.isAuthUserLoggedIn()) {
      this.router.navigate(['dashboard/home']);

    }
  }

  ngOnInit(): void {
    this.hide = true;
    this.buildForm();
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // tslint:disable-next-line: typedef
  get getNewYear() {
    return new Date().getUTCFullYear();
  }

  private buildForm(): void {
    this.loginForm = this.fb.group({
      email: ['user@rfidkolay.com', Validators.compose([Validators.required, Validators.maxLength(200)])],
      password: ['Prax-gusk-556-yas', Validators.compose([Validators.required, Validators.maxLength(25)])],
      rememberMe: true
    });
  }

  public loginUser(): void {
    // console.log(this.loginForm.value);
    if (!this.loginForm.valid || this.loginForm.value === null) {
      return;
    }

    this.isRequesting = true;

    this.subs.add(
      this.auth
        .loginUser(this.loginForm.value)
        .pipe(
          finalize(() => {
            this.isRequesting = false;
          })
        )
        .subscribe(
          (response: any) => {
            if (!response.body) { return; }
            if (response) {
              this.auth.storeLoginToken(response.body.access_token);
              this.router.navigate(['dashboard/home']);
            }
          },
          (error: HttpErrorResponse) => {
            if (error.status === 401) {
              this.errorMessageAlertMsg = this.translatorService.getTranslated(
                'SECURITY.ERROR.401'
              );
              this.snackBar.openErrorSnackBar(this.errorMessageAlertMsg);
            } else {
              this.errorMessageAlertMsg = this.translatorService.getTranslated(
                'SECURITY.ERROR.LOGIN_FAILED'
              );
              this.snackBar.openErrorSnackBar(this.errorMessageAlertMsg);
            }

            setTimeout(() => {
              this.errorMessageAlertMsg = '';
            }, 1200);
          }
        )
    );
  }
}
