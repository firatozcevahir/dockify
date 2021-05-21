import { Injectable } from '@angular/core';
import { BaseService } from '@app/shared/services/base-service.service';
import { TranslateService } from '@ngx-translate/core';


@Injectable({
  providedIn: 'root'
})

export class TranslatorService extends BaseService {

  constructor(private transService: TranslateService) {
    super();
  }

  // tslint:disable-next-line: typedef
  public getTranslated(terms: string) {
    let translateResults: any;
    this.transService.get(terms).subscribe((results: string) => {
      translateResults = results;
    });
    return translateResults;
  }


}
