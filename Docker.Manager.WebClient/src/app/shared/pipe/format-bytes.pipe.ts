import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'formatbytes'
})

export class FormatBytesPipe implements PipeTransform {

  private sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  private marker = 1024;
  transform(bytes: number, decimals: number): string {

    if (bytes === 0 || !bytes) {
      return '0 Bytes';
    }

    const dm = decimals < 0 ? 0 : decimals;
    const i = Math.floor(Math.log(bytes) / Math.log(this.marker));
    const result = (bytes / Math.pow(this.marker, i)).toFixed(dm) + ' ' + this.sizes[i];
    return result;
  }

}
