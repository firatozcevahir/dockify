import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DockerDetailComponent } from '@app/application/docker-manager/docker-detail/docker-detail.component';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { IServices } from '@app/application/interfaces/docker-swarm-service.interface';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink/index';
import { finalize } from 'rxjs/operators';
import { ListTasksComponent } from '../list-tasks/list-tasks.component';

@Component({
  selector: 'tps-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']

})
export class ServicesComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public isRequesting = false;
  public isServerError = false;

  public isMobile: boolean;
  public searchTerm: string;

  itemCount: number;
  itemSize: number;
  itemIndex: number;

  public dataSource = new MatTableDataSource<IServices>();
  public displayedColumns: string[] = ['id', 'name', 'image', 'endpoint', 'createdAt', 'updatedAt'];

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
        .on('service-updated')
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
        .GET_ANY(`${'/docker/list-service'}`)
        .pipe(
          finalize(() => {
            this.isRequesting = false;
          })
        )
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            this.dataSource = new MatTableDataSource<IServices>(response.result);
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


  public pageChanged(event): void { }

  public delete(item: any): void {
    this.dataservice.processRecordWithUndo(

      this.translatorService.getTranslated('SYSTEM.RECORD.IS_DELETING'), '/docker/remove-service', item, 'service-updated');

  }

  public startProcess(item: any, state: boolean): void {
    this.dataservice.processRecordWithUndo(
      this.translatorService.getTranslated('SYSTEM.RECORD.IS_PROCESSING'), '/docker/remove-service', item, 'service-updated');
  }

  public inspectProcess(item: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      record: item,
      url: '/docker/inspect-service/',
      title: item.spec.name
    };
    dialogConfig.autoFocus = true;
    dialogConfig.width = '60%';
    this.dialog.open(DockerDetailComponent, dialogConfig);
  }

  public listTasks(item: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      record: item,
      url: '/docker/list-service-tasks/',
      title: item.spec.name
    };

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '60%';
    this.dialog.open(ListTasksComponent, dialogConfig);
  }
}

