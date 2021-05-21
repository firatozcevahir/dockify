import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DockerDetailComponent } from '@app/application/docker-manager/docker-detail/docker-detail.component';
import { IDockerContainer } from '@app/application/interfaces/docker-container.interface';
import { DockerHubResponseType, IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { ConfirmComponent } from '@app/shared/dialogs/confirm/confirm.component';
import { ConfirmDialogType, ConfirmServiceType, IConfirmDialogResult } from '@app/shared/interfaces/IConfirmDialogResult.interface';
import { IRequestData } from '@app/shared/interfaces/IRequestData';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink/index';
import { finalize } from 'rxjs/operators';
import { ContainerDetailsComponent } from '../container-details/container-details.component';
import { ContainerDirectoriesComponent } from '../container-directories/container-directories.component';
import { ContainerLogsComponent } from '../container-logs/container-logs.component';
import { ContainerStatsComponent } from '../container-stats/container-stats.component';
import { ExecComponent } from '../exec/exec.component';

@Component({
  selector: 'tps-containers',
  templateUrl: './containers.component.html',
  styleUrls: ['./containers.component.scss'],
})
export class ContainersComponent implements OnInit, OnDestroy {

  @ViewChild('searchBar') searchBar: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public autoRefresh: boolean;
  public isRequesting = false;
  public isServerError = false;
  public isMobile: boolean;
  public searchTerm: string;
  public companyList: any[] = [];
  public intervalTimer: number;

  public containerSelection = new SelectionModel<IDockerContainer>(false, null);
  public selectedContainer: IDockerContainer;

  itemCount: number;
  itemSize: number;
  itemIndex: number;

  public dataSource = new MatTableDataSource<IDockerContainer>();
  public displayedColumns: string[] = ['id', 'names', 'tenant', 'state', 'image', 'ports', 'created'];

  private checkInterval = null;

  private searchModel: any = {};
  private subs = new SubSink();

  constructor(
    private dataservice: DataService,
    private customEventService: CustomEventService,
    private translatorService: TranslatorService,
    private dialog: MatDialog,
    private snackbarService: SnackBarService
  ) {
    this.autoRefresh = false;
    this.intervalTimer = 1;
  }

  ngOnInit(): void {
    this.loadCompanies();
    this.loadData();
    this.subs.add(
      this.customEventService.on('record-updated').subscribe(() => {
        this.loadData();
        this.selectedContainer = null;
        this.containerSelection.select(this.selectedContainer);
      }),

      this.dataservice.broadcastSearchTerms.subscribe(data => {

        this.searchTerm = data;
        this.applyFilter();
      }),

      this.containerSelection.changed.subscribe((item) => {
        // multiple selection is set to false, so added item count is always 1
        this.selectedContainer = item.added[0];
      })

    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.checkInterval) { clearInterval(this.checkInterval); }
  }

  public toggleAutoRefresh($event: boolean): void {
    if ($event) {
      this.checkInterval = setInterval(() => {
        this.loadData();
      }, 30000);
    } else {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  public onSearchClear(): void {
    this.searchTerm = '';
  }

  public loadData(): void {
    this.isRequesting = true;
    this.isServerError = false;
    this.subs.add(
      this.dataservice
        .GET_ANY<IDockerContainer>(`${'/docker/list-containers'}`)
        .pipe(finalize(() => {
          this.isRequesting = false;
        }))
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            // console.log(response.result);
            this.isRequesting = false;
            this.dataSource = new MatTableDataSource<IDockerContainer>(response.result);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.applyFilter();
          } else {
            this.snackbarService.openErrorSnackBar(response.result);
          }
        }, (error) => {
          // server error (docker daemon or server)
          this.isServerError = true;
          this.snackbarService.openErrorSnackBar(
            this.translatorService.getTranslated('SYSTEM.SERVER_ERROR')
          );
        })
    );
  }

  public loadCompanies(): void {
    this.subs.add(
      this.dataservice
        .GET_ANY<IRequestData>(`${'/company/active'}`)
        .subscribe((results: any) => {
          this.companyList = results.items;
        })
    );
  }
  public refreshData(): void {
    this.loadData();
  }

  public getId(id: string): string {
    return id.substr(0, 12);
  }

  public getImageName(name: string): string {
    const idx = name.indexOf('@');
    return idx < 1 ? name : name.substr(0, idx);
  }

  public applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  public pageChanged(event): void { }

  public delete(item: any): void {
    this.dataservice.processRecordWithUndo(

      this.translatorService.getTranslated('SYSTEM.RECORD.IS_DELETING'),
      '/docker/delete-container', item, 'record-updated');
  }

  public startProcess(item: any, state: boolean): void {
    this.dataservice.processRecordWithUndo(

      this.translatorService.getTranslated('SYSTEM.RECORD.IS_PROCESSING'),
      state ? '/docker/start-container' : '/docker/stop-container', item, 'record-updated');
  }

  public restartProcess(item: any): void {
    this.dataservice.processRecordWithUndo(
      this.translatorService.getTranslated('SYSTEM.RECORD.IS_PROCESSING'),
      '/docker/restart-container', item, 'record-updated'
    );
  }

  public pauseProcess(item: any, state: boolean): void {
    this.dataservice.processRecordWithUndo(
      this.translatorService.getTranslated('SYSTEM.RECORD.IS_PROCESSING'),
      state ? '/docker/unpause-container' : '/docker/pause-container', item, 'record-updated');
  }

  public openInBrowser(port: number, type: string): void {
    if (type === 'udp') { return; }

    const url = `${window.location.protocol}//${window.location.hostname}:${port}`;
    window.open(url, '_blank');
  }

  public browseVirtualHost(virtualHost: string): void {
    console.log(virtualHost);
    if (virtualHost.startsWith('http://') || virtualHost.startsWith('https://')) {
      window.open(virtualHost, '_blank');
      return;
    }
    window.open(`http://${virtualHost}`, '_blank');
  }

  public inspectProcess(item: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      record: item,
      url: '/docker/container-inspect/',
      title: item.image,
    };
    dialogConfig.autoFocus = true;
    dialogConfig.width = '60%';
    this.dialog.open(DockerDetailComponent, dialogConfig);
  }

  public renameContainer(id: string, mewName: string): void {
    const url = `${'/docker/rename-container/'}${id}/${mewName}`;
    this.subs.add(
      this.dataservice.GET_ANY(url).subscribe((response: IDockerHubResponse) => {
        if (response.success) {
          this.snackbarService.openSuccessSnackBar(this.translatorService.getTranslated('SYSTEM.ACTION.CON_RENAME_SUCCESS'));
          this.loadData();
        } else {
          this.snackbarService.openErrorSnackBar(response.result);
        }
      })
    );
  }

  public pruneContainer(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      title: 'CONFIRM_MODAL.CON_PRUNE_TITLE',
      message: 'CONFIRM_MODAL.CON_PRUNE_MESSAGE',
      type: ConfirmServiceType.PruneContainer
    };

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '25%';
    this.dialog
      .open(ConfirmComponent, dialogConfig)
      .afterClosed()
      .subscribe((result: IConfirmDialogResult) => {
        if (result.type === ConfirmDialogType.OperationSuccess) {
          this.snackbarService.openSuccessSnackBar(this.translatorService.getTranslated('SYSTEM.ACTION.CON_PRUNE_SUCCESS'));
          this.loadData();
        } else if (result.type === ConfirmDialogType.OperationFailed) {
          this.snackbarService.openErrorSnackBar(result.message);
        } else {
          this.snackbarService.openInfoSnackBar(result.message);
        }
      });
  }

  public seeStats(item: IDockerContainer): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      imageName: item.image,
      containerName: item.names[0].substr(1, item.names[0].length),
      id: item.id
    };
    dialogConfig.autoFocus = true;
    dialogConfig.width = '50%';
    this.dialog
      .open(ContainerStatsComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        // console.log('after closed', result);
      });
  }

  public seeLogs(item: IDockerContainer): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      imageName: item.image,
      containerName: item.names[0].substr(1, item.names[0].length),
      id: item.id
    };
    dialogConfig.autoFocus = true;
    dialogConfig.width = '75%';
    this.dialog
      .open(ContainerLogsComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        // console.log('after closed', result);
      });
  }

  public showDirectories(item: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      id: item.id
    };
    dialogConfig.autoFocus = true;
    dialogConfig.width = '75%';
    this.dialog
      .open(ContainerDirectoriesComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        // console.log('after closed', result);
      });
  }

  public getCompanyName(id: string): string {

    const company = this.companyList.find(a => a.id === id);
    if (!company) {
      return '';
    }

    return company.name;
  }

  public showContainerDetails(item: IDockerContainer): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '90%';
    dialogConfig.data = {
      id: item.id
    };
    this.dialog.open(ContainerDetailsComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        // console.log('after closed', result);
      });
  }
  public execCreate(item: IDockerContainer): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '90%';
    dialogConfig.data = {
      id: item.id
    };
    this.dialog.open(ExecComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        // console.log('after closed', result);
      });
  }
}
