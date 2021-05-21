
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IRequestData } from '@app/shared/interfaces/IRequestData';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink/index';
import { fadeInAnimation } from '@app/shared/_animations';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'tps-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],

  animations: [fadeInAnimation],
  // tslint:disable-next-line: no-host-metadata-property
  host: { '[@fadeInAnimation]': '' },
})
export class SettingsComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public isRequesting = false;
  public isServerError = false;

  public isMobile: boolean;
  public searchTerm: string;

  itemCount: number;
  itemSize: number;
  itemIndex: number;

  public dataSource = new MatTableDataSource<any>();
  public displayedColumns: string[] = ['id', 'name', 'registryUrl', 'userName', 'authenticationRequired', 'personalAccessToken', 'createdOn'];

  public selected = [];

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
      this.customEventService.on('registry-updated').subscribe(() => this.loadData()),

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

  public applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  public loadData(): void {
    this.isRequesting = true;
    this.isServerError = false;
    const url = `${'/registry/list-registry'}`;

    this.subs.add(
      this.dataservice
        .GET_ANY<IRequestData>(url)
        .pipe(
          finalize(() => {
            this.isRequesting = false;
          })
        )
        .subscribe((results: IRequestData) => {
          this.dataSource = new MatTableDataSource<any>(results.items);
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

  public pageChanged(event): void { }

  public delete(item: any): void {
    // global delete method with a little twist..
    this.dataservice.deleteRecordWithUndo(
      this.translatorService.getTranslated('SYSTEM.RECORD.IS_DELETING'), '/registry/delete', item, 'registry-updated'
    );
  }

}

