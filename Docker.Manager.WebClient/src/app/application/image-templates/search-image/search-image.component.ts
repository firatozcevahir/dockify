import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IRequestData } from '@app/shared/interfaces/IRequestData';
import { DataService } from '@app/shared/services/data-servcie';
import { SubSink } from '@app/shared/subsink';

@Component({
  selector: 'tps-search-image',
  templateUrl: './search-image.component.html',
  styleUrls: ['./search-image.component.scss'],
})
export class SearchImageComponent implements OnInit, OnDestroy {
  public title: string;
  public resultData: any;

  public searchTerm: any;
  private subs = new SubSink();

  constructor(
    public dialogRef: MatDialogRef<SearchImageComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private dataservice: DataService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.dataservice
        .GET_ANY<IRequestData>(`${'/docker/search-image/'}${this.searchTerm}`)
        .subscribe((results: any) => {
          this.resultData = results;
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  public onClose(): void {
    this.dialogRef.close();
  }
}
