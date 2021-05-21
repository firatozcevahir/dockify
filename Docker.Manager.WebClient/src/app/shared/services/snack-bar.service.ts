import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarDismiss,
  MatSnackBarHorizontalPosition,
  MatSnackBarRef,
  MatSnackBarVerticalPosition
} from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { SnackBarDialogComponent } from '../../shared/dialogs/snackbar-dialog/snackbar-dialog.component';

@Injectable()
export class SnackBarService {

  snackBarConfig: MatSnackBarConfig;
  snackBarRef: MatSnackBarRef<any>;
  dismissed: Observable<MatSnackBarDismiss>;
  horizontalPosition: MatSnackBarHorizontalPosition = 'left';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  snackBarAutoHide = 7000;
  panelClass = null;

  constructor(private snackBar: MatSnackBar) { }


  public openSuccessSnackBar(message: string): MatSnackBarRef<any> {
    this.panelClass = 'success-snackbar';
    this.openSnackBar(message);
    return this.snackBarRef;
  }

  public openErrorSnackBar(message: string): MatSnackBarRef<any> {
    this.panelClass = 'err-snackbar';
    this.openSnackBar(message);
    return this.snackBarRef;
  }

  public openInfoSnackBar(message: string): MatSnackBarRef<any> {
    this.panelClass = 'info-snackbar';
    this.openSnackBar(message);
    return this.snackBarRef;
  }

  private openSnackBar(message: string): MatSnackBarRef<any> {

    this.snackBarConfig = new MatSnackBarConfig();
    this.snackBarConfig.horizontalPosition = this.horizontalPosition;
    this.snackBarConfig.verticalPosition = this.verticalPosition;
    this.snackBarConfig.duration = this.snackBarAutoHide;
    this.snackBarConfig.panelClass = this.panelClass;

    this.snackBarRef = this.snackBar.openFromComponent(SnackBarDialogComponent, {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.snackBarAutoHide,
      panelClass: this.panelClass,
      data: { message, type: this.panelClass, ref: this.snackBar }
    });
    return this.snackBarRef;
  }

}
