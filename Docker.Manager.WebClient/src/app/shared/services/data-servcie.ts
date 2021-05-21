import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DockerHubResponseType, IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { BaseService } from '@app/shared/services/base-service.service';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  catchError,
  delay,
  map,
  publishReplay,
  refCount,
  retry,
  shareReplay
} from 'rxjs/operators';
import { SubSink } from '../subsink';
import { CustomEventService } from './custom-event.service';
import { SnackBarService } from './snack-bar.service';
import { TranslatorService } from './translator.service';

@Injectable({ providedIn: 'root' })
export class DataService extends BaseService {

  public globalSystemInfo: BehaviorSubject<any> = new BehaviorSubject(null);
  public broadcastGlobalSystemInfo = this.globalSystemInfo.asObservable();

  public globalSearchTerms: BehaviorSubject<string> = new BehaviorSubject('');
  public broadcastSearchTerms = this.globalSearchTerms.asObservable();

  private subs = new SubSink();

  constructor(
    private transService: TranslateService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    // private matSnackBarConfig: MatSnackBarConfig,
    private customEventService: CustomEventService,
    private snackbarService: SnackBarService,
    private translateService: TranslatorService
  ) {
    super();
  }


  public getParametersData(item: any): Observable<any> {
    const languageJson = `${'./assets/languages/i18n'}/${this.transService.currentLang}` + '.json';
    return this.http.get(languageJson)
      .pipe(
        publishReplay(1),
        refCount(),
        map((res: any) => (res.TUTORIAL[item]))
      );
  }

  public getParametersByItem(item: any): Observable<any> {
    const languageJson =
      `${'./assets/languages/i18n'}/${this.transService.currentLang}` + '.json';
    return this.http
      .get(languageJson)
      .pipe(map((res: any) => res.DATA[item]));
  }

  public GET_ALL<T>(service: string, model: any): any {
    return this.http.post<T>(`${environment.api}${service}`, model).pipe(
      publishReplay(1),
      refCount(),
      delay(100),
      catchError((error) => {
        return this.handleError(error);
      })
    );
  }

  public GET_BY_ID<T>(service: string, Id: string): Observable<T> {
    const url = `${environment.api}${service}/${Id}`;
    return this.http.get<T>(url).pipe(
      catchError((error) => {
        return this.handleError(error);
      })
    );
  }

  /// Get method to endpoint get-records
  public GET_ANY<T>(service: string): any {
    return this.http.get<T>(`${environment.api}${service}`).pipe(
      shareReplay(),
      catchError((error) => {
        return this.handleError(error);
      })
    );
  }

  public SAVE<T>(url: string, data: any): any {
    return this.http.post<T>(`${environment.api}${url}`, data).pipe(
      catchError((error) => {
        return this.handleError(error);
      })
    );
  }

  public UPDATE<T>(service: string, data?: any, params?: any): Observable<T> {
    const url = `${environment.api}${service}`;
    return this.http.put<T>(url, data).pipe(retry(3));
  }

  public SEARCH_ALL<T>(url: string, model: any): any {
    return this.http.post<T>(`${environment.api}${url}`, model).pipe(
      publishReplay(1),
      refCount(),
      catchError((error) => {
        return this.handleError(error);
      })
    );
  }

  public deleteRecordWithUndo(message: string, service: string, item: any, action?: any): void {
    this.snackBar
      .open(message, this.translateService.getTranslated('SYSTEM.RECORD.CANCEL'), { duration: 4000 })
      .afterDismissed()
      .subscribe((info) => {
        if (info.dismissedByAction === false) {
          this.deleteRecord(item, service, action);
        }
      });
  }

  // tslint:disable-next-line: typedef
  public deleteRecord(item: any, url: string, action: any = 'record-deleted', state: boolean = true): void {

    this.subs.add(
      this.UPDATE(`${url}/${item.id}`).subscribe((result: any) => {
        if (result.success) {
          if (state) {
            this.snackbarService.openSuccessSnackBar(
              this.translateService.getTranslated(
                'SYSTEM.RECORD.PROCESS_COMPLETED'
              )
            );
          }
          this.customEventService.publish(action);
        }
      })
    );

  }

  public processRecordWithUndo(
    message: string,
    service: string,
    item: any,
    action?: any
  ): void {
    this.snackBar
      .open(message, this.translateService.getTranslated('SYSTEM.RECORD.CANCEL'), { duration: 5000 })
      .afterDismissed()
      .subscribe((info) => {
        if (info.dismissedByAction === false) {

          const query = item ? `${service}/${item.id || item.name}` : `${service}/`;
          this.GET_ANY(query).subscribe((response: IDockerHubResponse) => {
            if (response.success) {
              switch (response.type) {
                case DockerHubResponseType.StartContainerResponse: {
                  this.snackbarService.openSuccessSnackBar(this.translateService.getTranslated('SYSTEM.ACTION.CON_START_SUCCESS'));
                  break;
                }
                case DockerHubResponseType.StopContainerResponse: {
                  this.snackbarService.openSuccessSnackBar(this.translateService.getTranslated('SYSTEM.ACTION.CON_STOP_SUCCESS'));
                  break;
                }
                case DockerHubResponseType.PauseContainerResponse: {
                  this.snackbarService.openSuccessSnackBar(this.translateService.getTranslated('SYSTEM.ACTION.CON_PAUSE_SUCCESS'));
                  break;
                }
                case DockerHubResponseType.UnPauseContainerResponse: {
                  this.snackbarService.openSuccessSnackBar(this.translateService.getTranslated('SYSTEM.ACTION.CON_UNPAUSE_SUCCESS'));
                  break;
                }
                case DockerHubResponseType.DeleteContainerResponse: {
                  this.snackbarService.openSuccessSnackBar(this.translateService.getTranslated('SYSTEM.ACTION.CON_DEL_SUCCESS'));
                  break;
                }
                case DockerHubResponseType.DeleteImageResponse: {
                  this.snackbarService.openSuccessSnackBar(this.translateService.getTranslated('SYSTEM.ACTION.IMG_DEL_SUCCESS'));
                  break;
                }
                case DockerHubResponseType.DeleteNetworkResponse: {
                  this.snackbarService.openSuccessSnackBar(this.translateService.getTranslated('SYSTEM.ACTION.NETWORK_DEL_SUCCESS'));
                  break;
                }
                case DockerHubResponseType.DeleteVolumeResponse: {
                  this.snackbarService.openSuccessSnackBar(this.translateService.getTranslated('SYSTEM.ACTION.VOLUME_DEL_SUCCESS'));
                  break;
                }
                case DockerHubResponseType.DeleteSwarmServiceResponse: {
                  this.snackbarService.openSuccessSnackBar(this.translateService.getTranslated('SYSTEM.ACTION.SWARMSERVICE_DEL_SUCCESS'));
                  break;
                }
                case DockerHubResponseType.DeleteVolumeResponse: {
                  this.snackbarService.openSuccessSnackBar(this.translateService.getTranslated('SYSTEM.ACTION.VOLUME_DEL_SUCCESS'));
                  break;
                }
                case DockerHubResponseType.RestartContainerResponse: {
                  this.snackbarService.openSuccessSnackBar(this.translateService.getTranslated('SYSTEM.ACTION.CON_RESTART_SUCCESS'));
                  break;
                }

                default: {
                  break;
                }
              }
              this.customEventService.publish(action);
            } else {
              this.snackbarService.openErrorSnackBar(response.result);
            }
          }, (error) => {
            console.error(error);
          });
        }
      });
  }
}
