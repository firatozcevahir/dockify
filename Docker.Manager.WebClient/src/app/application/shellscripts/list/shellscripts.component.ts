
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
  selector: 'tps-shellscripts',
  templateUrl: './shellscripts.component.html',
  styleUrls: ['./shellscripts.component.scss'],
  animations: [fadeInAnimation],
  host: { '[@fadeInAnimation]': '' }
})

export class ShellscriptsComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public isRequesting = false;
  public isServerError = false;

  public searchTerm: string;


  public itemCount: number;
  public itemSize: number;
  public itemIndex: number;



  public dataSource = new MatTableDataSource<any>();
  public displayedColumns: string[] = ['id', 'name', 'fullPath', 'fileName', 'createdOn'];


  private subs = new SubSink();

  constructor(
    private dataservice: DataService,
    private customEventService: CustomEventService,
    private translatorService: TranslatorService,
    private snackbarService: SnackBarService
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.subs.add(

      this.customEventService.on('shellscript-updated').subscribe(() => this.loadData()),

      this.dataservice.broadcastSearchTerms.subscribe(data => {

        this.searchTerm = data;
        this.applyFilter();

      })

    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadData() {
    this.isRequesting = true;
    this.isServerError = false;
    const url = `${'/shell-script/list-shellscript'}`;

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
          console.log(results.items);

        }, (error) => {
          // server error (docker daemon or server)
          this.isServerError = true;
          this.snackbarService.openErrorSnackBar(
            this.translatorService.getTranslated('SYSTEM.SERVER_ERROR')
          );
        })
    );
  }

  public applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }
  public onSearchClear(): void {
    this.searchTerm = '';
  }

  public pageChanged(event): void { }

  public delete(item: any): void {
    // global delete method with a little twist..
    this.dataservice.deleteRecordWithUndo(
      this.translatorService.getTranslated('SYSTEM.RECORD.IS_DELETING'), '/shell-script/delete', item, 'shellscript-updated'
    );
  }
}
