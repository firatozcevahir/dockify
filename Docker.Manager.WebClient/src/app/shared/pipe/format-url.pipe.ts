
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'formaturl'
})

export class FormatUrlPipe implements PipeTransform {

  transform(url: string): any {
    if (!url) {
      return null;
    }

    if (url.startsWith('https://')) {
      return url.replace('https://', '');
    }
    if (url.startsWith('http://')) {
      return url.replace('http://', '');
    }
  }
}
