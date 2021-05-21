import { MyConstants } from './../constants/constants';
import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

import * as moment from 'moment';

@Pipe({
  name: 'dateTimeFormat',
  pure: false
})
export class DateTimeFormatPipe extends DatePipe implements PipeTransform {

  private dateDisplayFormat: string;

  transform(value: any, args?: any): any {

    const localeData = moment.localeData();
    return super.transform(value, MyConstants.DATE_TIME_FMT );
  }

}

