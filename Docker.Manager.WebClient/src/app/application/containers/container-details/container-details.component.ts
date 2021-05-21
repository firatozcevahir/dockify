import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IDockerContainerInspect } from '@app/application/interfaces/docker-container-inspect.interface';
import { DockerHubResponseType, IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink';
import { Clipboard } from '@angular/cdk/clipboard';
import { IDockerNetwork } from '@app/application/interfaces/docker-network.interface';
import { finalize } from 'rxjs/operators';
import { CustomEventService } from '@app/shared/services/custom-event.service';

@Component({
  selector: 'tps-app-container-details',
  templateUrl: './container-details.component.html',
  styleUrls: ['./container-details.component.scss']
})
export class ContainerDetailsComponent implements OnInit, OnDestroy {

  private id: string;
  public isRequesting = false;
  public isConnecting = false;
  public isRenaming = false;
  public newContainerName: string;


  public networkList: IDockerNetwork[] = [];

  public container: IDockerContainerInspect;
  private subs = new SubSink();

  constructor(
    public dialogRef: MatDialogRef<ContainerDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private dataservice: DataService,
    private snackbarService: SnackBarService,
    private translatorService: TranslatorService,
    private clipBoard: Clipboard,
    private customEventService: CustomEventService
  ) {
    this.id = data.id;
  }

  ngOnInit(): void {
    this.subs.add(
      this.dataservice
        .GET_ANY<IDockerNetwork>(`${'/docker/list-networks'}`)
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            this.networkList = response.result;
          }
        })
    );

    this.loadData();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  public loadData(): void {

    this.isRequesting = true;
    this.subs.add(
      this.dataservice.GET_ANY<IDockerHubResponse>(`${'/docker/container-inspect/'}${this.id}`)
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            this.container = response.result;
            this.newContainerName = this.container.name.substr(1);
            this.isRequesting = false;
          } else {
            this.snackbarService.openErrorSnackBar(response.result);
          }
        })
    );
  }

  public onClose(): void {
    this.dialogRef.close();
  }

  public copyText(txt: string): void {
    this.clipBoard.copy(txt);
    this.snackbarService.openInfoSnackBar(
      `${this.translatorService.getTranslated('SYSTEM.COPIED')}: ${txt}`
    );
  }

  public networkOperation(id: string, netId: string, state: boolean): void {
    const url = state ?
      `${'/docker/connect-network/'}${netId}/${id}` :
      `${'/docker/disconnect-network/'}${netId}/${id}`;
    this.isRequesting = true;

    this.subs.add(
      this.dataservice.GET_ANY(url)
        .pipe(
          finalize(() => {
            this.isConnecting = false;
          })
        )
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {

            if (response.type === DockerHubResponseType.ConnectNetworkResponse) {
              this.snackbarService.openSuccessSnackBar(this.translatorService.getTranslated('SYSTEM.ACTION.NETWORK_CONN_SUCCESS'));
            } else {
              this.snackbarService.openSuccessSnackBar(this.translatorService.getTranslated('SYSTEM.ACTION.NETWORK_DISCONN_SUCCESS'));
            }

            this.loadData();
          } else {
            this.snackbarService.openErrorSnackBar(response.result);
          }
        })
    );
  }

  public renameContainer(id: string, newName: string): void {
    const url = `${'/docker/rename-container/'}${id}/${newName}`;
    this.isRenaming = true;
    this.subs.add(
      this.dataservice.GET_ANY(url)
        .pipe(
          finalize(() => {
            this.isRenaming = false;
          })
        )
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            this.snackbarService.openSuccessSnackBar(this.translatorService.getTranslated('SYSTEM.ACTION.CON_RENAME_SUCCESS'));
            
            this.customEventService.publish('record-updated');
            this.loadData();
          } else {
            this.snackbarService.openErrorSnackBar(response.result);
          }
        })
    );
  }
}
