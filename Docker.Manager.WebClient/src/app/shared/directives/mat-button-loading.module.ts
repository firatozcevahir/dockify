import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonLoadingDirective } from './mat-button-loading.directive';

@NgModule({
  imports: [
    CommonModule,

    FormsModule,
    ReactiveFormsModule,

    TranslateModule,
  ],
  declarations: [MatButtonLoadingDirective],
  exports: [MatButtonLoadingDirective]
})
export class MatButtonLoadingModule { }
