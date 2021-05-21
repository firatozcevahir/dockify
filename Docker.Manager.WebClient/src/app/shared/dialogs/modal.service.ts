import { Injectable } from '@angular/core';
import { AlertComponent, ModalAlertData, AlertType } from './alert/alert.component';
import { ConfirmComponent, ModalConfirmData } from './confirm/confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslatorService } from '../services/translator.service';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  constructor(
    private translatorService: TranslatorService,
    public dialog: MatDialog
  ) { }

  getAlertTitle(alertType: AlertType) {
    switch (alertType) {
      case AlertType.INFO:
        return 'INFO';
      case AlertType.WARNING:
        return 'WARNING';
      case AlertType.ERROR:
        return 'ERROR';
    }
  }

  openAlertModal(message: string, alertType: AlertType) {
    const dialogRef = this.dialog.open(AlertComponent, {
      width: '300px',
      data: new ModalAlertData({
        title: this.getAlertTitle(alertType),
        content: message,
        closeButtonLabel: 'Close',
        alertType: alertType
      })
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('After Close Modal', result);
    });
  }

  openInfoModal(message: string) {
    this.openAlertModal(message, AlertType.INFO);
  }

  openWarningModal(message: string) {
    this.openAlertModal(message, AlertType.WARNING);
  }

  openErrorModal(message: string) {
    this.openAlertModal(message, AlertType.ERROR);
  }

  openConfirmModal(message: string, callBackFunction: Function) {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '300px',
      data: new ModalConfirmData({
        title: this.translatorService.getTranslated('SYSTEM.RECORD.ARE_YOU_SURE'),
        content: message,
        confirmButtonLabel: this.translatorService.getTranslated('SYSTEM.RECORD.CONFIRM'),
        closeButtonLabel: this.translatorService.getTranslated('SYSTEM.CLOSE'),
      })
    });

    dialogRef.afterClosed().subscribe(result => callBackFunction(result));
  }

}
