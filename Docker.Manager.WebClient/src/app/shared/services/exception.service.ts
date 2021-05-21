import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ModalService } from './../dialogs/modal.service';

@Injectable({ providedIn: 'root' })
export class ExceptionService {

  public errorMessage = '';

  constructor(
    private modalService: ModalService) { }

  catchBadResponse: (errorResponse: any) => Observable<any> = (errorResponse: any) => {

    const res = errorResponse as HttpErrorResponse;
    const err = res;
    const emsg = err ? (err.error ? err.error : JSON.stringify(err)) : (res.statusText || 'unknown error');

    //  this.createErrorMessage(err);

    this.modalService.openErrorModal( emsg.message  );

    return of(false);

  }

  private createErrorMessage(error: HttpErrorResponse): void {
    this.errorMessage = error.error ? error.error : error.statusText;
  }

}

