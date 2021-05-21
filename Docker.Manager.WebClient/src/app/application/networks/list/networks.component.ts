import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DockerDetailComponent } from '@app/application/docker-manager/docker-detail/docker-detail.component';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { IDockerNetwork } from '@app/application/interfaces/docker-network.interface';
import { ConfirmComponent } from '@app/shared/dialogs/confirm/confirm.component';
import { ConfirmDialogType, ConfirmServiceType, IConfirmDialogResult } from '@app/shared/interfaces/IConfirmDialogResult.interface';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink/index';
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'tps-networks',
  templateUrl: './networks.component.html',
  styleUrls: ['./networks.component.scss'],
})
export class NetworksComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public isRequesting = false;
  public isServerError = false;

  public isMobile: boolean;
  public searchTerm: string;

  itemCount: number;
  itemSize: number;
  itemIndex: number;

  public dataSource = new MatTableDataSource<IDockerNetwork>();
  public displayedColumns: string[] = ['id', 'name', 'driver', 'scope', 'attachable', 'enableIPv6', 'created'];


  private subs = new SubSink();

  constructor(
    private dataservice: DataService,
    private customEventService: CustomEventService,
    private translatorService: TranslatorService,
    private dialog: MatDialog,
    private snackBarService: SnackBarService
  ) { }

  ngOnInit(): void {
    this.loadData();

    this.subs.add(
      this.customEventService
        .on('record-updated')
        .subscribe(() => this.loadData()),

      this.dataservice.broadcastSearchTerms.subscribe(data => {

        this.searchTerm = data;
        this.applyFilter();


      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  public onSearchClear(): void {
    this.searchTerm = '';
  }

  public loadData(): void {
    this.isRequesting = true;
    this.isServerError = false;
    this.subs.add(
      this.dataservice
        .GET_ANY<IDockerNetwork>(`${'/docker/list-networks'}`)
        .pipe(finalize(() => {
          this.isRequesting = false;
        }))
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            this.dataSource = new MatTableDataSource<IDockerNetwork>(response.result);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.applyFilter();
          } else {
            this.snackBarService.openErrorSnackBar(response.result);
          }
        }, (error) => {
          // server error (docker daemon or server)
          this.isServerError = true;
          this.snackBarService.openErrorSnackBar(
            this.translatorService.getTranslated('SYSTEM.SERVER_ERROR')
          );
        })
    );
  }

  public getId(id: string): string {
    return id.substr(0, 12);
  }

  public applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  public pruneNetwork(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      title: 'CONFIRM_MODAL.NETWORK_PRUNE_TITLE',
      message: 'CONFIRM_MODAL.NETWORK_PRUNE_MESSAGE',
      type: ConfirmServiceType.PruneImage
    };

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '25%';
    this.dialog
      .open(ConfirmComponent, dialogConfig)
      .afterClosed()
      .subscribe((result: IConfirmDialogResult) => {
        if (result.type === ConfirmDialogType.OperationSuccess) {
          this.snackBarService.openSuccessSnackBar(this.translatorService.getTranslated('SYSTEM.ACTION.NETWORK_PRUNE_SUCCESS'));
          this.loadData();
        } else if (result.type === ConfirmDialogType.OperationFailed) {
          this.snackBarService.openErrorSnackBar(result.message);
        } else {
          this.snackBarService.openInfoSnackBar(result.message);
        }
      });
  }

  public pageChanged(event): void { }

  public delete(item: any): void {
    this.dataservice.processRecordWithUndo(

      this.translatorService.getTranslated('SYSTEM.RECORD.IS_DELETING'), '/docker/delete-network', item, 'record-updated');

  }

  public startProcess(item: any, state: boolean): void {
    // this.dataservice.processRecordWithUndo(
    //   this.translatorService.getTranslated('SYSTEM.RECORD.IS_PROCESSING'),
    //   state ? '/docker/connect-network' : '/docker/disconnect-network',
    //   item, 'record-updated'
    // );
  }

  public inspectProcess(item: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      record: item,
      url: '/docker/network-inspect/',
      title: item.name
    };
    dialogConfig.autoFocus = true;
    dialogConfig.width = '60%';
    this.dialog.open(DockerDetailComponent, dialogConfig);
  }

}
