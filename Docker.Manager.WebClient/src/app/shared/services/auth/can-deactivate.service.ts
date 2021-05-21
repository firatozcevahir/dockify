import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot, CanDeactivate,

  RouterStateSnapshot
} from '@angular/router';
import { TranslatorService } from '@shared/services/translator.service';
import { Observable } from 'rxjs';


export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({ providedIn: 'root' })
export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
  constructor(private ranslatorService: TranslatorService) {}

  // tslint:disable-next-line: typedef
  canDeactivate(
    component: CanComponentDeactivate,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ) {
    const isDirty = component.canDeactivate;
    if (isDirty) {
      if (
        confirm(
          this.ranslatorService.getTranslated(
            'CRUD_ACTIONS.RECORDS.ALERT_POPUP.LEAVE_WITHOUT_SAVING'
          )
        )
      ) {
        return true;
      } else {
        return false;
      }
    }
  }
}
