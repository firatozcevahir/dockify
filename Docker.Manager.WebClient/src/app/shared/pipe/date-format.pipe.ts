import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import { MyConstants } from '../constants/constants';

@Pipe({
  name: 'dateFormat',
  pure: false
})
export class DateFormatPipe extends DatePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    const localeData = moment.localeData();
    return super.transform(value, MyConstants.DATE_FMT);
  }

}

