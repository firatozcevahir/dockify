import { Injectable } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { TranslatorService } from './translator.service';



@Injectable({
  providedIn: 'root'
})

export class TranslateMatPaginatorService  extends MatPaginatorIntl {

  constructor(private translatorService: TranslatorService) {
    super();
   }

  public translateMatPaginator(paginator: MatPaginator): void {

    paginator._intl.firstPageLabel = this.translatorService.getTranslated('SYSTEM.RECORD.PAGINATION.FIRST_PAGE_LABEL');
    paginator._intl.lastPageLabel = this.translatorService.getTranslated('SYSTEM.RECORD.PAGINATION.LST_PAGE_LABEL');
    paginator._intl.nextPageLabel = this.translatorService.getTranslated('SYSTEM.RECORD.PAGINATION.NEXT_PAGE_LABEL');
    paginator._intl.previousPageLabel = this.translatorService.getTranslated('SYSTEM.RECORD.PAGINATION.PREVIOUS_PAGE_LABEL');
    paginator._intl.itemsPerPageLabel = this.translatorService.getTranslated('SYSTEM.RECORD.PAGINATION.ITEMS_PER_PAGE_LABEL');

  }

}
