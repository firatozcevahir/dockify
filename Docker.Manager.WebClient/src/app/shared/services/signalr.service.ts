import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import * as signalR from '@microsoft/signalr';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { CustomEventService } from './custom-event.service';
import { IImageProgress } from '@app/application/interfaces/image-progress.interface';

@Injectable({ providedIn: 'root' })

export class SignalRService {
  private hubConnection: HubConnection;
  private imageProgressData: IImageProgress;
  private imagePushProgressData: IImageProgress;
  private execResponse: any;
  private containerStats: any;
  private containerLog: string;
  private connectionId: string;

  constructor(private customEventService: CustomEventService) {

  }

  public get getImageProgressData(): IImageProgress {
    return this.imageProgressData;
  }

  public get getImagePushProgressData(): IImageProgress {
    return this.imagePushProgressData;
  }

  public get getContainerStats(): any {
    return this.containerStats;
  }

  public get getContainerLog(): string {
    return this.containerLog;
  }

  public get getConnectionId(): string {
    return this.connectionId;
  }
  public get getExecResponse(): any {
    return this.execResponse;
  }


  public createConnection(): void {
    this.hubConnection = new HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Debug)
      .withUrl(`${environment.api}/progresshub`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    /* this.hubConnection = new HubConnectionBuilder()
         .withUrl(environment.api + '/progresshub')
         .build();*/


    this.hubConnection.on('imageProgressUpdate', (res: IImageProgress | string) => {
      if (typeof (res) === 'string') {
        if (res.startsWith('Error:')) {
          console.error(res);
        }
        return;
      }

      this.imageProgressData = res;
      this.customEventService.publish('image-progress-update');
    });

    this.hubConnection.on('containerStatProgressUpdate', res => {
      this.containerStats = res;
      this.customEventService.publish('container-stat-update');
    });

    this.hubConnection.on('imagePushProgressUpdate', res => {
      this.imagePushProgressData = res;
      this.customEventService.publish('image-push-progress-update');
    });

    this.hubConnection.on('monitorEvents', res => {
      // console.log(res);
    });

    this.hubConnection.on('ExecResponse', res => {
      this.execResponse = res;
      this.customEventService.publish('exec-response-update');
    })



    this.hubConnection.start().then(() => {
      this.hubConnection.invoke('GetConnectionID').then((connectionId) => {
        console.log('SignalR ConnectionID', connectionId);
        this.connectionId = connectionId;
      });
    }).catch((err) => {
      console.error(err.toString());
    });
  }
}
