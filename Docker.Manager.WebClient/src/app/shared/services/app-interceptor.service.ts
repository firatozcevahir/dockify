import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, mergeMap, retryWhen, take } from 'rxjs/operators';

@Injectable()
export class AppInterceptor implements HttpInterceptor {

  private requests: HttpRequest<any>[] = [];

  private teknopalas: any;
  private delayInMinutesBetweenRetries = 1000;
  private numberOfRetries = 5;
  private authorizationHeader = 'Authorization';

  constructor(
    private inj: Injector,
    private router: Router
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    this.teknopalas = JSON.parse(localStorage.getItem('dockifylogin')) || [];

    const accessToken = this.teknopalas ? this.teknopalas.access_token : null;

    if (accessToken) {
      req = req.clone({
        setHeaders: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      this.requests.push(req);

      return next.handle(req).pipe(
        retryWhen(errors => errors.pipe(
          mergeMap((error: HttpErrorResponse, retryAttempt: number) => {

            if (retryAttempt === this.numberOfRetries - 1) {
              console.log(`HTTP call '${req.method} ${req.url}' failed after ${this.numberOfRetries} retries.`);
              return throwError(error); // no retry
            }

            switch (error.status) {
              case 400:
              case 404:
                return throwError(error); // no retry
              case 419:
                break;
            }

            // this.removeRequest(req);
            return of(error); // retry

          }),
          delay(this.delayInMinutesBetweenRetries),
          take(this.numberOfRetries)
        )),
        catchError((error: any, caught: Observable<HttpEvent<any>>) => {

          console.error({ error, caught });

          if (error.status === 403) {
            this.router.navigate(['/accessdenied']);
          }

          if (error.status === 401) {

            const newRequest = this.getNewAuthRequest(req);
            if (newRequest) {
              return next.handle(newRequest);
            }

            this.router.navigate(['/security/login']);

          }
          return throwError(error);
        })
      );
    } else {
      // login page
      //  this.removeRequest(req);
      return next.handle(req);
    }
  }

  getNewAuthRequest(request: HttpRequest<any>): HttpRequest<any> | null {

    this.teknopalas = JSON.parse(localStorage.getItem('dockifylogin'));

    const newStoredToken = this.teknopalas ? this.teknopalas.access_token : null;

    const requestAccessTokenHeader = request.headers.get(this.authorizationHeader);

    if (!newStoredToken || !requestAccessTokenHeader) {
      console.log('There is no new AccessToken.', { requestAccessTokenHeader: requestAccessTokenHeader, newStoredToken: newStoredToken });
      return null;
    }

    const newAccessTokenHeader = `Bearer ${newStoredToken}`;

    if (requestAccessTokenHeader === newAccessTokenHeader) {
      console.log('There is no new AccessToken.',
        { requestAccessTokenHeader: requestAccessTokenHeader, newAccessTokenHeader: newAccessTokenHeader });
      return null;
    }

    return request.clone({ headers: request.headers.set(this.authorizationHeader, newAccessTokenHeader) });
  }

}

