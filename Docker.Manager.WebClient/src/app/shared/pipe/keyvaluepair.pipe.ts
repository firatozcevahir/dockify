
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'keyvaluepair'
})

export class KeyValuePairPipe implements PipeTransform {

  transform(obj: any): any {
    const objArr = [];
    const o = Object.entries(obj);

    for (const [key, value] of o) {
      objArr.push({ key, value });
    }

    return objArr;
  }
}
