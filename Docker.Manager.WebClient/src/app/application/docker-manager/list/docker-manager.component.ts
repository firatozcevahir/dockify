import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { IDockerImages } from '@app/application/interfaces/docker-images.interface';
import { IImageProgress } from '@app/application/interfaces/image-progress.interface';
import { ConfirmComponent } from '@app/shared/dialogs/confirm/confirm.component';
import { ConfirmDialogType, ConfirmServiceType, IConfirmDialogResult } from '@app/shared/interfaces/IConfirmDialogResult.interface';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { DataService } from '@app/shared/services/data-servcie';
import { SignalRService } from '@app/shared/services/signalr.service';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink/index';
import { finalize } from 'rxjs/operators';
import { DockerDetailComponent } from '../docker-detail/docker-detail.component';
import { PushToRegistryComponent } from '../push-to-registry/push-to-registry.component';

@Component({
  selector: 'tps-docker-manager',
  templateUrl: './docker-manager.component.html',
  styleUrls: ['./docker-manager.component.scss'],
})
export class DockerManagerComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public isRequesting = false;
  public isServerError = false;


  public isMobile: boolean;
  public searchTerm: string;
  public isDownloadingImage = false;

  public imageUsage = { inuse: 0, total: 0 };

  // public dataSource: any = [];

  itemCount: number;
  itemSize: number;
  itemIndex: number;

  public imageProgressData: IImageProgress;

  public dataSource = new MatTableDataSource<IDockerImages>();
  public displayedColumns: string[] = ['id', 'repoTags', 'size', 'created' /*'operations'*/];

  private searchModel: any = {};
  private subs = new SubSink();

  constructor(
    private dialog: MatDialog,
    private dataservice: DataService,
    private customEventService: CustomEventService,
    private translatorService: TranslatorService,
    private signalRService: SignalRService,
    private snackBarService: SnackBarService
  ) {
  }

  ngOnInit(): void {
    this.loadData();

    this.subs.add(
      this.customEventService
        .on('application-updated')
        .subscribe(() => this.loadData()),

      this.dataservice.broadcastSearchTerms.subscribe(data => {

        this.searchTerm = data;
        this.applyFilter();

      })

    );

    this.subs.add(this.customEventService
      .on('image-progress-update')
      .subscribe(() => { this.handleImageProgressData(); })
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
        .GET_ANY<IDockerImages>(`${'/docker/list-images'}`)
        .pipe(finalize(() => {
          this.isRequesting = false;
        }))
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            this.dataSource = new MatTableDataSource<IDockerImages>(response.result);
            this.imageUsage = {
              inuse: response.result.filter((a) => a.containers > 0).reduce((a, b) => a + b.size, 0),
              total: response.result.reduce((a, b) => a + b.size, 0),
            };
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

  public applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  public getId(id: string): string {
    return id.substr(7, 12);
  }

  public pageChanged(event): void {

  }

  public delete(item: any): void {
    this.dataservice.processRecordWithUndo(
      this.translatorService.getTranslated('SYSTEM.RECORD.IS_DELETING'),
      '/docker/delete-image',
      item,
      'application-updated'
    );
  }

  public pruneImage(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      title: 'CONFIRM_MODAL.IMAGE_PRUNE_TITLE',
      message: 'CONFIRM_MODAL.IMAGE_PRUNE_MESSAGE',
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
          this.snackBarService.openSuccessSnackBar(this.translatorService.getTranslated('SYSTEM.ACTION.IMG_PRUNE_SUCCESS'));
          this.loadData();
        } else if (result.type === ConfirmDialogType.OperationFailed) {
          this.snackBarService.openErrorSnackBar(result.message);
        } else {
          this.snackBarService.openInfoSnackBar(result.message);
        }
      });
  }

  public inspectImage(item: any, state: boolean): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      record: item,
      url: state ? '/docker/image-inspect/' : '/docker/image-history/',
      title: item.repoTags,
    };
    dialogConfig.autoFocus = true;
    dialogConfig.width = '60%';
    this.dialog.open(DockerDetailComponent, dialogConfig);
  }

  public pushToRegistry(item: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      record: item
    };

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '70%';
    this.dialog.open(PushToRegistryComponent, dialogConfig);
  }

  public handleImageProgressData(): void {
    this.imageProgressData = this.signalRService.getImageProgressData;
    this.isDownloadingImage = true;
    const status = this.imageProgressData.status;
    if (status.startsWith('Status:') || status.startsWith('Digest:')) {
      this.loadData();
      this.isDownloadingImage = false;
    }
  }

  public handleMouseEnter(row: any): void {
    row.hovered = true;
  }
  public handleMouseLeave(row: any): void {
    row.hovered = false;
  }

}
