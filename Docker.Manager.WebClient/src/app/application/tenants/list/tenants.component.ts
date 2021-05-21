import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ITenants } from '@app/application/interfaces/tenants.interface';
import { IRequestData } from '@app/shared/interfaces/IRequestData';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink/index';
import { finalize } from 'rxjs/operators';
import { EditTenantComponent } from '../edit/edit-tenant.component';

@Component({
  selector: 'tps-tenants',
  templateUrl: './tenants.component.html',
  styleUrls: ['./tenants.component.scss']

})
export class TenantsComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public isRequesting = false;
  public isServerError = false;

  public isMobile: boolean;
  public searchTerm: string;

  itemCount: number;
  itemSize: number;
  itemIndex: number;

  public dataSource = new MatTableDataSource<ITenants>();
  public displayedColumns: string[] = ['id', 'name', 'telephoneNo', 'contactPerson', 'emailAddress', 'dnsName', 'createdOn'];

  private searchModel: any = {};
  private subs = new SubSink();

  constructor(
    private dataservice: DataService,
    private customEventService: CustomEventService,
    private translatorService: TranslatorService,
    private dialog: MatDialog,
    private snackbarService: SnackBarService
  ) { }

  ngOnInit(): void {
    this.loadData();

    this.subs.add(
      this.customEventService.on('tenants-updated').subscribe(() => {
        this.loadData();
      }),

      this.dataservice.broadcastSearchTerms.subscribe(data => {

        this.searchTerm = data;
        this.applyFilter();

      })

    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  public preparedSearchModel(): void {
    this.searchModel = {
      name: null,
      dnsName: null,
      imageName: null,
      telephoneNo: null,
      pageIndex: 0,
      pageSize: 1000,
    };
  }

  public onSearchClear(): void {
    this.searchTerm = '';
  }

  public applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  public loadData(): void {
    this.isRequesting = true;
    this.isServerError = false;
    this.subs.add(
      this.dataservice
        .SEARCH_ALL<IRequestData>(`${'/company/search-model'}`, this.searchModel)
        .pipe(
          finalize(() => {
            this.isRequesting = false;
          })
        )
        .subscribe((results: any) => {
          this.dataSource = new MatTableDataSource<ITenants>(results.items);
          this.itemCount = this.dataSource.data.length;
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.applyFilter();

        }, (error) => {
          // server error (docker daemon or server)
          this.isServerError = true;
          this.snackbarService.openErrorSnackBar(
            this.translatorService.getTranslated('SYSTEM.SERVER_ERROR')
          );
        })
    );
  }

  public getId(id: string): string {
    return id.substr(0, 12);
  }

  public pageChanged(event): void { }

  public delete(item: any): void {

    this.dataservice.deleteRecordWithUndo(
      this.translatorService.getTranslated('SYSTEM.RECORD.IS_DELETING'), '/company/delete', item, 'tenants-updated'
    );

  }

  public renameProcess(item: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      title: item.image,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    this.dialog
      .open(EditTenantComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        //  this.loadData();
      });
  }

  public detail(item: any): void {

  }



}
