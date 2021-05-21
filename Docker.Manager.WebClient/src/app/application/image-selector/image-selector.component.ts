import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgSelectConfig } from '@ng-select/ng-select';

@Component({
  selector: 'tps-image-selector',
  templateUrl: './image-selector.component.html',
  styleUrls: ['./image-selector.component.scss']

})
export class ImageSelectorComponent implements OnInit, OnDestroy {
  public title: string;
  public retValue: any;
  public hubList: any = [];

  constructor(
    public dialogRef: MatDialogRef<ImageSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) data,

    private config: NgSelectConfig,
  ) {
    this.config.notFoundText = 'Custom not found';
    this.config.appendTo = 'body';

    this.title = data.title;
    const imagesList: any = data.record;

    this.hubList = imagesList.sort((a, b) => {
      return ((b.starCount) as any) - ((a.starCount) as any);
    });

  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  public onClose(status: boolean): void {
    this.dialogRef.close(status ? this.retValue : null);
  }

  public getSelectedData($event: any): void {

    this.retValue = $event;
  }

}
