import {
  HttpClient,
  HttpHeaders, HttpParams
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { IAuthUser } from '@app/security/interfaces/auth-user.interface';
import { ILoginModel } from '@app/security/interfaces/login-model.interface';
import { BaseService } from '@app/shared/services/base-service.service';
import { environment } from '@env/environment';
import {
  BehaviorSubject,


  Subscription
} from 'rxjs';
import { retry } from 'rxjs/operators';
import { JwtHelperService } from './jwt-helper.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationService extends BaseService {
  private AuthEndPiont: string;
  private expiresAt: number;
  private refreshSub: Subscription;
  private tokenType: string;
  private isToken: string;

  public isLoggedIn = false;
  public redirectUrl: string;
  public loginUrl: string;
  public permissions: Array<string>;

  private authStatusSource = new BehaviorSubject<boolean>(false);
  authStatus$ = this.authStatusSource.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient,
    private jwtHelperService: JwtHelperService
  ) {
    super();

    this.AuthEndPiont = environment.auth_api;

    this.updateStatusOnPageRefresh();
    // this.scheduleToGetNewToken(this.isAuthUserLoggedIn());
  }

  /**
   * validate user credentials against back-end api for authentication
   */
  public loginUser<T>(loginModel: ILoginModel): any {

    const body = new HttpParams()
      .set('username', loginModel.email)
      .set('password', loginModel.password)
      .set('grant_type', 'password')
      .set('scope', 'com.kolayrfid.spa-api openid')
      .set('client_id', 'com.kolayrfid.web')
      .set('client_secret', '');
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post(environment.stsAuthority + '/connect/token',
      body.toString(), { headers, observe: 'response' })
      .pipe(
        //   map((response: any) => {
        //     if (!response) {
        //       this.authStatusSource.next(false);
        //       return response;
        //     }

        //     this.storeLoginToken<T>(response);
        //     this.scheduleToGetNewToken(true);
        //     this.authStatusSource.next(true);

        //     return response;
        //   }),

        retry(3)

      );

    // const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    // const url = `${this.AuthEndPiont}${'/login'}`;

    // return this.http.post(url, loginModel, { headers }).pipe(
    //   map((response: any) => {
    //     if (!response) {
    //       this.authStatusSource.next(false);
    //       return response;
    //     }

    //     this.isLoggedIn = true;
    //     this.storeLoginToken<T>(response);
    //     this.scheduleToGetNewToken(true);
    //     this.authStatusSource.next(true);

    //     return response;
    //   }),
    //   catchError((error: HttpErrorResponse) => throwError(error))
    // );
  }

  /**
   * store current logged-In user token
   */
  public storeLoginToken<T>(token: any): void {
    const jwtData: any = this.jwtHelperService.decodeToken(
      token
    );
    const loginData = {
      access_token: token,
      // refresh_token: response.refreshToken,
      expires_in: jwtData.exp,
      // currentUserRole: jwtData['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
      displayName: jwtData.given_name,
    };

    localStorage.setItem('dockifylogin', JSON.stringify(loginData));
    this.isLoggedIn = true;
    this.authStatusSource.next(true);
  }

  /**
   * check if logged user is in role
   */
  // public isUserInRoles(requiredRoles: string[]): boolean {
  //   const user = this.getAuthUser();
  //   if (!user || !user.roles) {
  //     return false;
  //   }

  //   if (user.roles.indexOf('SuperAdmin') >= 0) {
  //     return true; // The `SuperAdmin` role has full access to every pages.
  //   }

  //   return requiredRoles.some((requiredRole) => {
  //     if (user.roles) {
  //       const isUseInRole = user.roles.indexOf(requiredRole);
  //       return isUseInRole >= 0;
  //     } else {
  //       return false;
  //     }
  //   });
  // }

  // public isAuthUserInRole(requiredRole: string): boolean {
  //   return this.isUserInRoles([requiredRole]);
  // }

  /**
   * validate current logged-In user roles
   */
  // public hasRequiredPermission(roleId: string): boolean {
  //   const user = this.getAuthUser();
  //   if (!user || !user.roles) {
  //     return false;
  //   }

  //   this.permissions = this.getCurrentUserRoles();
  //   if (
  //     this.permissions &&
  //     this.permissions.find((permission) => {
  //       return permission === roleId;
  //     })
  //   ) {
  //     return true;
  //   }

  //   return false;
  // }

  /**
   * logout current logged-In user
   */
  public logout(navigateToHome: boolean): void {
    this.isLoggedIn = false;
    localStorage.removeItem('dockifylogin');
    this.router.navigate(['/security/login']);

    // const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // const teknopalasAS: any =
    //   JSON.parse(localStorage.getItem('teknopalas')) || [];

    // const model = { accessToken: teknopalasAS.access_token };

    // this.http
    //   .post(`${this.AuthEndPiont}/logout`, model, { headers })
    //   .pipe(
    //     map((response: any) => {
    //       if (response) {
    //         localStorage.removeItem('teknopalas');

    //         this.unscheduleRefreshToken();

    //         this.authStatusSource.next(false);

    //         this.router.navigate(['/security/login']);
    //       }
    //     }),
    //     catchError((error: HttpErrorResponse) => throwError(error))
    //   )
    //   .subscribe((result) => { });
  }

  // private unscheduleRefreshToken(): void {
  //   if (this.refreshSub) {
  //     this.refreshSub.unsubscribe();
  //   }
  // }

  /**
   * create logged-In user data file
   */
  public getAuthUser(): IAuthUser | null {
    const loginInfo: any = JSON.parse(localStorage.getItem('dockifylogin'));

    if (loginInfo == null || loginInfo === undefined) {
      return null;
    }

    if (!this.isAuthUserLoggedIn()) {
      return null;
    }

    return Object.freeze({
      refresh_token: loginInfo.refresh_token,
      roles: loginInfo.currentUserRole,
      access_token: loginInfo.access_token,
      displayName: loginInfo.displayName,
      avatar: null,
    });
  }

  /**
   * get current logged user role rights
   */
  // public getCurrentUserRoles(defaultValue: string[] = []): string[] {
  //   const data: any = JSON.parse(localStorage.getItem('teknopalas'));

  //   if (data === null || data === undefined) {
  //     return null;
  //   }
  //   const isToken = data.access_token;
  //   if (isToken == null) {
  //     return defaultValue;
  //   } else {
  //     const jwtData = this.jwtHelperService.decodeToken(isToken);
  //     const roles = data.currentUserRole;
  //     return roles as string[];
  //   }
  // }

  /**
   * check current logged user state
   */
  public isAuthUserLoggedIn(): boolean {
    const data: any = JSON.parse(localStorage.getItem('dockifylogin'));
    if (data == null || data === undefined) {
      return false;
    }
    return data && !this.isAccessTokenTokenExpired();
  }

  // check current logged user token validity

  private isAccessTokenTokenExpired(): boolean {
    const expirationDateUtc = this.getAccessTokenExpirationDateUtc();
    if (!expirationDateUtc) {
      return true;
    }
    return !(expirationDateUtc.valueOf() > new Date().valueOf());
  }

  /**
   * calculate current logged-In user token expiration date
   */
  private getAccessTokenExpirationDateUtc(): Date | null {
    const dockifyLogin: any =
      JSON.parse(localStorage.getItem('dockifylogin')) || [];
    if (dockifyLogin.expires_in === undefined) {
      return null;
    }
    const date = new Date(0); // The 0 sets the date to the epoch
    date.setUTCSeconds(dockifyLogin.expires_in);
    return date;
  }

  /**
   * schedule current logged-In user refresh token
   */
  // tslint:disable-next-line: typedef
  // private scheduleToGetNewToken(isAuthUserLoggedIn: boolean) {
  //   if (!isAuthUserLoggedIn) {
  //     return;
  //   }
  //   const teknopalasAS: any =
  //     JSON.parse(localStorage.getItem('teknopalas')) || [];

  //   if (teknopalasAS) {
  //     const isToken = teknopalasAS.access_token;
  //     const expiresAt = parseFloat(teknopalasAS.expires_in);

  //     this.unscheduleRenewal();

  //     const expiresIn$ = of(expiresAt).pipe(
  //       mergeMap((expires: any) => {
  //         const now: number = new Date().valueOf() / 1000;
  //         // let iat = new Date(expiresAt).getTime() / 1000;   // for later usage

  //         const refreshTokenThreshold = 30; // set next token-refresh seconds
  //         let delay: number = expiresAt - now;

  //         // let totalLife: number = (expiresAt - iat);  // for later usage
  //         delay < refreshTokenThreshold ? (delay = 1) : (delay = delay - refreshTokenThreshold);

  //         return timer(delay * 1000);
  //       })
  //     );

  //     this.refreshSub = expiresIn$.subscribe(() => {
  //       console.log('time to refresh...');
  //       this.refreshToken(isAuthUserLoggedIn);
  //     });
  //   } else {
  //     this.returnBackToLogin();
  //   }
  // }

  /**
   * refresh current logged-In user token
   */

  // tslint:disable-next-line: typedef
  // private refreshToken(isAuthUserLoggedIn: boolean) {
  //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  //   const teknopalasAS: any = JSON.parse(localStorage.getItem('teknopalas'));

  //   if (
  //     teknopalasAS.refresh_token === null ||
  //     teknopalasAS.refresh_token === undefined
  //   ) {
  //     this.returnBackToLogin();
  //   }

  //   const model = { refreshToken: teknopalasAS.refresh_token };

  //   const url = `${this.AuthEndPiont}/refresh-token`;

  //   return this.http
  //     .post(url, model, { headers })
  //     .pipe(
  //       map((response) => response || {}),
  //       catchError((error: HttpErrorResponse) => throwError(error))
  //     )
  //     .subscribe((result: any) => {
  //       console.log('result', result);

  //       this.storeLoginToken(result);
  //       this.scheduleToGetNewToken(isAuthUserLoggedIn);
  //     });
  // }

  /**
   * unsubcribe  current logged-In user from schedule
   */
  // private unscheduleRenewal(): void {
  //   if (this.refreshSub) {
  //     this.refreshSub.unsubscribe();
  //   }
  // }

  /**
   * redirect user to login component
   */
  // private returnBackToLogin(): void {
  //   if (this.refreshSub) {
  //     this.refreshSub.unsubscribe();
  //   }
  //   this.router.navigate(['/security/login']);
  // }

  private isAuthenticated(): boolean {
    const istoken: any = JSON.parse(localStorage.getItem('dockifylogin')) || [];
    const isToken = istoken.access_token;
    return this.jwtHelperService.isTokenExpired(isToken);
  }

  private updateStatusOnPageRefresh(): void {
    this.authStatusSource.next(this.isAuthUserLoggedIn());
  }
}
