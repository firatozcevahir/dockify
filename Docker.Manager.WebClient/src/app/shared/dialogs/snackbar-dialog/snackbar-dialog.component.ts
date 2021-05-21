import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { TranslatorService } from '@app/shared/services/translator.service';

@Component({
    selector: 'tps-snackbar-dialog',
    templateUrl: './snackbar-dialog.component.html',
    styleUrls: ['./snackbar-dialog.component.css']
})
export class SnackBarDialogComponent implements OnInit {

    public type: string;
    public message: string;
    public snackbarRef: MatSnackBarRef<any>;
    constructor(
        @Inject(MAT_SNACK_BAR_DATA) public data: any,
        private translateService: TranslatorService
    ) {
        this.type = this.getType(data.type);
        this.message = data.message;
        this.snackbarRef = data.ref;
    }

    ngOnInit(): void {

    }

    public getType(type: string): string {
        switch (type) {
            case 'err-snackbar': {
                return this.translateService.getTranslated('SYSTEM.ACTION.FAILURE');
            }
            case 'success-snackbar': {
                return this.translateService.getTranslated('SYSTEM.ACTION.SUCCESS');
            }

            default: {
                return this.translateService.getTranslated('SYSTEM.ACTION.INFO');
            }
        }
    }

    public closeSnackBar(): void {
        this.snackbarRef.dismiss();
    }
}
