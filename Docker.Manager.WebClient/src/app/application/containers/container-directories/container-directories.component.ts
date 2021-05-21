import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { SubSink } from '@app/shared/subsink';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslatorService } from '@app/shared/services/translator.service';

@Component({
  selector: 'tps-container-directories',
  templateUrl: './container-directories.component.html',
  styleUrls: ['./container-directories.component.scss']
})
export class ContainerDirectoriesComponent implements OnInit, OnDestroy {

  public isRequesting = false;
  private subs = new SubSink();
  public record: any = {};
  private id: string;
  constructor(
    public dialogRef: MatDialogRef<ContainerDirectoriesComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private dataservice: DataService,
    private snackbarService: SnackBarService,
    private clipBoard: Clipboard,
    private translatorService: TranslatorService
  ) {
    this.id = data.id;
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  public loadData(): void {

    this.isRequesting = true;
    this.subs.add(
      this.dataservice.GET_ANY<IDockerHubResponse>(`${'/docker/container-inspect/'}${this.id}`)
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            this.record = response.result;
            this.isRequesting = false;
          } else {
            this.snackbarService.openErrorSnackBar(response.result);
          }
        })
    );
  }

  public copyPath(path: string): void {
    this.clipBoard.copy(path);
    this.snackbarService.openInfoSnackBar(
      `${this.translatorService.getTranslated('SYSTEM.COPIED')}: ${path}`
    );
  }

  public onClose(): void {
    this.dialogRef.close();
  }
}
