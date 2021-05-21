import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonLoadingModule } from '@app/shared/directives/mat-button-loading.module';
import { TranslateModule } from '@ngx-translate/core';
import { AlertComponent } from './alert/alert.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { ModalService } from './modal.service';


@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    TranslateModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonLoadingModule,
  ],
  declarations: [AlertComponent, ConfirmComponent],
  entryComponents: [AlertComponent, ConfirmComponent],
  providers: [ModalService]
})
export class ModalDialogsModule { }
