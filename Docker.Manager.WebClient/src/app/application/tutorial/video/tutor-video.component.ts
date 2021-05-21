
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SubSink } from '@app/shared/subsink';

@Component({
  selector: 'tps-tutor-video',
  templateUrl: './tutor-video.component.html',
  styleUrls: ['./tutor-video.component.scss']

})
export class TutorVideoComponent implements OnInit, OnDestroy {

  public record: any;
  private subs = new SubSink();

  constructor(
    public dialogRef: MatDialogRef<TutorVideoComponent>, @Inject(MAT_DIALOG_DATA) data,
  ) {

    this.record = data.record;
    console.log(this.record);

  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  public onClose(): void {
    this.dialogRef.close();
  }
}
