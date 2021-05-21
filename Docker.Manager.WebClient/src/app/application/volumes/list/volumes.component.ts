
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DockerDetailComponent } from '@app/application/docker-manager/docker-detail/docker-detail.component';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { IVolume } from '@app/application/interfaces/docker-volume.interface';
import { ConfirmComponent } from '@app/shared/dialogs/confirm/confirm.component';
import { ConfirmDialogType, ConfirmServiceType, IConfirmDialogResult } from '@app/shared/interfaces/IConfirmDialogResult.interface';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink/index';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'tps-volumes',
  templateUrl: './volumes.component.html',
  styleUrls: ['./volumes.component.scss']
})
export class VolumesComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public isRequesting = false;
  public isServerError = false;

  public isMobile: boolean;
  public searchTerm;
  public isDownloadingImage = false;

  itemCount: number;
  itemSize: number;
  itemIndex: number;

  public dataSource = new MatTableDataSource<IVolume>();
  //  public displayedColumns: string[] = ['id', 'name', 'driver', 'mountpoint', 'scope', 'options', 'createdAt'];

  public displayedColumns: string[] = ['id', 'name', 'driver', 'mountpoint', 'createdAt'];

  private searchModel: any = {};
  private subs = new SubSink();

  constructor(
    private dialog: MatDialog,
    private snackBarService: SnackBarService,
    private dataservice: DataService,
    private customEventService: CustomEventService,
    private translatorService: TranslatorService,
  ) { }

  ngOnInit(): void {
    this.loadData();

    this.subs.add(
      this.customEventService
        .on('volume-updated')
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
        .GET_ANY<IVolume>(`${'/docker/list-volume'}`)
        .pipe(finalize(() => {
          this.isRequesting = false;
        }))
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            this.dataSource = new MatTableDataSource<IVolume>(response.result.volumes);
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
    return id;
  }

  public applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  public pageChanged(event): void {

  }

  public inspectVolume(item: IVolume): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      record: item,
      url: '/docker/inspect-volume/',
      title: item.name,
    };
    dialogConfig.autoFocus = true;
    dialogConfig.width = '60%';
    this.dialog.open(DockerDetailComponent, dialogConfig);
  }


  public delete(item: any): void {
    const url = `${'/docker/remove-volume'}`;
    this.dataservice.processRecordWithUndo(
      this.translatorService.getTranslated('SYSTEM.RECORD.IS_DELETING'), url, item, 'volume-updated');
  }

  public pruneUnusedVolumes(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      title: 'CONFIRM_MODAL.VOL_PRUNE_TITLE',
      message: 'CONFIRM_MODAL.VOL_PRUNE_MESSAGE',
      type: ConfirmServiceType.PruneVolume
    };

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '25%';
    this.dialog
      .open(ConfirmComponent, dialogConfig)
      .afterClosed()
      .subscribe((result: IConfirmDialogResult) => {
        if (result.type === ConfirmDialogType.OperationSuccess) {
          this.snackBarService.openSuccessSnackBar(this.translatorService.getTranslated('SYSTEM.ACTION.VOLUME_PRUNE_SUCCESS'));
          this.loadData();
        } else if (result.type === ConfirmDialogType.OperationFailed) {
          this.snackBarService.openErrorSnackBar(result.message);
        } else {
          this.snackBarService.openInfoSnackBar(result.message);
        }
      });
  }
}
