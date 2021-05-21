import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

export abstract class BaseService {

  constructor() { }

  // tslint:disable-next-line: typedef
  protected handleError(error: HttpErrorResponse) {

    const applicationError = error.headers.get('Application-Error');

    if (applicationError) {
      return throwError(applicationError);
    }

    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {

      if (error.status === 0) {
        return throwError(error.statusText);
      }

      let modelStateErrors = '';

      for (const key in error.error) {
        if (error.error[key]) {
          modelStateErrors += error.error[key].description + '\n';
        }
      }

      modelStateErrors = modelStateErrors = '' ? null : modelStateErrors;
      return throwError(modelStateErrors || 'Server error');
    }

    return throwError('Request failed, please try again!');
  }
}
