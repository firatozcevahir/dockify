import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { IImageTemplate } from '@app/application/interfaces/image-template.interface';
import { Guid } from '@app/shared/constants/constants';
import { IErrorResponse } from '@app/shared/interfaces/IErrorResponse';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink/index';
import { fadeInAnimation } from '@app/shared/_animations';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'tps-docker-template',
  templateUrl: './docker-template.component.html',
  styleUrls: ['./docker-template.component.scss'],

  animations: [fadeInAnimation],
  // tslint:disable-next-line: no-host-metadata-property
  host: { '[@fadeInAnimation]': '' },
})
export class DockerTemplateComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public appTemplates: IImageTemplate[] = [];
  public isMobile: boolean;
  public searchTerm: string;
  public isRequesting: boolean;
  public isServerError = false;

  itemCount: number;
  itemSize: number;
  itemIndex: number;

  // public dataSource = new MatTableDataSource<IMageTemplate>();
  // public displayedColumns: string[] = ['id', 'title', 'registryName', 'descriptions', 'logoURL', 'hostName', 'createdOn'];


  private searchModel: any = {};
  private subs = new SubSink();

  constructor(
    private dataservice: DataService,
    private customEventService: CustomEventService,
    private translatorService: TranslatorService,
    private dialog: MatDialog,
    private snackbarService: SnackBarService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.preparedSearchModel();
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
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  public applyFilter(): void {
    // this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  public onSearchClear(): void {
    this.searchTerm = '';
  }

  public preparedSearchModel(): void {
    this.searchModel = {
      title: null,
      descriptions: null,
      imageName: null,
      registryName: null,
      hostName: null,
      pageIndex: 0,
      pageSize: 1000,
    };
  }

  public loadData(): void {
    const url = `${'/app-template/search-model'}`;
    this.isRequesting = true;
    this.isServerError = false;

    this.subs.add(
      this.dataservice
        .SEARCH_ALL<IImageTemplate[]>(url, this.searchModel)
        .pipe(
          finalize(() => {
            this.isRequesting = false;
          })
        )
        .subscribe((results: any) => {

          this.appTemplates = results.items;
          this.applyFilter();
        }, (error) => {
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
      this.translatorService.getTranslated('SYSTEM.RECORD.IS_DELETING'), '/app-template/delete', item, 'application-updated');

  }

  public onImgError($event: any): void {
    const imgElem = ($event.target as HTMLImageElement);
    const parentElem = imgElem.parentElement;
    parentElem.style.backgroundImage = 'url("./assets/images/noimage.png")';
    imgElem.src = './assets/images/noimage.png';
  }


  // private getNewName(templateTitle: string): string {
  //   const title = templateTitle;
  //   let name = `${title}_${this.translatorService.getTranslated('SYSTEM.RECORD.COPY')}`;
  //   let tempName = '';
  //   let counter = 0;
  //   let count = this.appTemplates.filter(t => t.templateTitle === name).length;

  //   while (count > 0) {
  //     counter++;
  //     tempName = `${name}_${counter}`;
  //     count = this.appTemplates.filter(t => t.templateTitle === tempName).length;

  //     // limit while loop by 200
  //     if (counter > 200) { count = 0; }
  //   }

  //   if (counter > 0) { name += `_${counter}`; }
  //   return name;
  // }

  // public cloneTemplate(template: IImageTemplate): void {
  //   const dto = template;
  //   dto.templateTitle = this.getNewName(template.templateTitle);

  //   dto.id = Guid.newGuid();

  //   this.subs.add(
  //     this.dataservice.SAVE<IErrorResponse>(`${'/app-template/post'}`, dto)
  //       .pipe(
  //         finalize(() => {
  //           this.isRequesting = false;
  //         })
  //       )
  //       .subscribe(
  //         (results: any) => {
  //           if (results.success) {
  //             this.isRequesting = false;

  //             this.customEventService.publish('application-updated');

  //             this.snackbarService.openSuccessSnackBar(
  //               this.translatorService.getTranslated(
  //                 'SYSTEM.RECORD.PROCESS_COMPLETED'
  //               )
  //             );
  //             console.log('this should navigate now');
  //             this.router.navigate([`${this.router.url}/edit`, dto.id ]);
  //           } else {
  //             this.snackbarService.openErrorSnackBar(results.message);
  //           }
  //         },
  //         (error) => {
  //           this.isRequesting = false;
  //           this.snackbarService.openErrorSnackBar(error.message);
  //         }
  //       )
  //   );
  // }
}
