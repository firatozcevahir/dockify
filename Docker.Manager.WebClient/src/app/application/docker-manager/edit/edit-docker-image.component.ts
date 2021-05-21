import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ImageSelectorComponent } from '@app/application/image-selector/image-selector.component';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { IDockerImages } from '@app/application/interfaces/docker-images.interface';
import { IDockerRegistry } from '@app/application/interfaces/docker-registry.interface';
import { IErrorResponse } from '@app/shared/interfaces/IErrorResponse';
import { IRequestData } from '@app/shared/interfaces/IRequestData';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { DataService } from '@app/shared/services/data-servcie';
import { SignalRService } from '@app/shared/services/signalr.service';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink/index';
import { slideInOutAnimation } from '@app/shared/_animations';
import { Observable } from 'rxjs';
import { finalize, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'tps-edit-docker-image',
  templateUrl: './edit-docker-image.component.html',
  styleUrls: ['./edit-docker-image.component.scss'],

  encapsulation: ViewEncapsulation.None,
  animations: [slideInOutAnimation],
  // tslint:disable-next-line: no-host-metadata-property
  host: { '[@slideInOutAnimation]': '' },
})
export class EditDockerImageComponent implements OnInit, OnDestroy {
  public dataFRM: FormGroup;

  public groupList$: Observable<any>;
  public TITLE: string;
  public isRequesting: boolean;
  public descriptions: string;

  public tagType$: Observable<any>;
  public hubList$: Observable<any>;
  public selectedGroup: any = [];
  public photoGalleryList: any = [];
  public dockerRegistryList: IDockerRegistry[] = [];

  public images: string[] = [];
  public filteredImages: Observable<string[]>;

  public imageProgressData: any;

  private progress: any;
  private editMode: boolean;
  private subs = new SubSink();
  private recordId: string;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialogModel: MatDialog,
    private dataservice: DataService,
    private snackBarService: SnackBarService,

    private signalRService: SignalRService,
    private translatorService: TranslatorService,
    private customEventService: CustomEventService
  ) { }

  ngOnInit(): void {
    this.createEmptyForm();
    this.loadParameters();

    this.TITLE = this.translatorService.getTranslated(
      'SYSTEM.RECORD.PULL_IMAGE'
    );

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private createEmptyForm(): void {
    this.dataFRM = this.fb.group({
      fromImage: [null, Validators.compose([Validators.maxLength(100)])],
      fromSrc: null
    });
  }

  private loadParameters(): void {

    this.subs.add(
      this.dataservice
        .GET_ANY<IDockerRegistry>(`${'/registry/list-registry'}`)
        .subscribe((results: IRequestData) => {
          this.dockerRegistryList = results.items;
          this.dataFRM.controls.fromSrc.setValue(this.dockerRegistryList[0]);

          this.subs.add(
            this.dataservice
              .GET_ANY<IDockerImages>(`${'/docker/list-images'}`)
              .subscribe((response: IDockerHubResponse) => {
                if (response.success) {

                  this.filteredImages = this.dataFRM.controls.fromImage.valueChanges.pipe(
                    startWith(''),
                    map((value: string) => this._filter(value))
                  );

                  response.result.forEach((image: { repoTags: any[]; }) => {
                    image.repoTags?.filter((a: string) => a !== '<none>:<none>').forEach((repoTag: string) => {
                      this.images.push(repoTag);
                    });
                  });
                }
              })
          );
        })
    );
  }

  public handleRegistryChange(): void {

    this.filteredImages = this.dataFRM.controls.fromImage.valueChanges.pipe(
      startWith(''),
      map((value: string) => this._filter(value))
    );

  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    const selectedRegistry = this.dataFRM.controls.fromSrc.value;
    const selectedRegistryUrl = this.formatUrl(selectedRegistry.registryUrl);
    const isDockerRegistry = selectedRegistryUrl.includes('docker.io');

    if (isDockerRegistry) {
      return this.images
        // tslint:disable-next-line: max-line-length
        .filter((option) => option.includes(selectedRegistryUrl) || this.dockerRegistryList.findIndex(a => option.includes(this.formatUrl(a.registryUrl))) < 0)
        .filter((option, index, arr) => arr.indexOf(option) === index)
        .filter((option) => option.toLowerCase().includes(filterValue));
    }

    return this.images
      .filter((option) => option.includes(selectedRegistryUrl))
      .map((a) => a.substr(a.indexOf('/') + 1))
      .filter((option, index, arr) => arr.indexOf(option) === index)
      .filter((option) => option.toLowerCase().includes(filterValue));
  }

  private formatUrl(url: string): any {
    if (!url) {
      return null;
    }

    if (url.startsWith('https://')) {
      return url.replace('https://', '');
    }
    if (url.startsWith('http://')) {
      return url.replace('http://', '');
    }
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.dataFRM.controls[controlName].hasError(errorName);
  }

  public async saveData(): Promise<void> {
    try {
      this.isRequesting = true;
      this.subs.add(
        this.dataservice
          .SAVE<IErrorResponse>(
            `${'/docker/create-image-from-image'}`,
            this.dataFRM.value
          )
          .pipe(
            finalize(() => {
              this.isRequesting = false;
            })
          )
          .subscribe(
            (response: IDockerHubResponse) => {

              this.router.navigate(['/app/docker-manager']);

              if (response.success) {
                this.isRequesting = false;
                this.customEventService.publish('application-updated');

                this.snackBarService.openSuccessSnackBar(
                  this.translatorService.getTranslated(
                    'SYSTEM.RECORD.PROCESS_COMPLETED'
                  )
                );
              } else {
                this.snackBarService.openErrorSnackBar(response.result);
              }
            },
            (error: any) => {
              this.isRequesting = false;
            }
          )
      );
    } catch (error) { }
  }

  public searchForImage(): void {
    if (
      this.dataFRM.controls.fromImage.value === null ||
      this.dataFRM.controls.fromImage.value === undefined
    ) {
      return;
    }

    this.subs.add(
      this.dataservice
        .SAVE<IDockerHubResponse>(`${'/docker/search-image/'}`, {
          searchTerm: this.dataFRM.controls.fromImage.value,
          dockerRegistry: this.dataFRM.controls.fromSrc.value
        })
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            if (response.result.length > 0) {
              this.OpenHubImageList(response.result);
            } else {
              this.snackBarService.openErrorSnackBar(this.translatorService.getTranslated('SYSTEM.ACTION.IMG_NOT_FOUND'));
            }
          } else {
            this.snackBarService.openErrorSnackBar(response.result);
          }
        })
    );
  }

  private OpenHubImageList(item: any): void {

    const dialogConf = new MatDialogConfig();
    dialogConf.data = {
      record: item,
      title: this.dataFRM.controls.fromImage.value,
    };
    dialogConf.disableClose = true;
    dialogConf.autoFocus = true;
    dialogConf.width = '40%';
    this.dialogModel.open(ImageSelectorComponent, dialogConf).afterClosed().subscribe((res: { name: any; description: string; }) => {
      if (res) {
        this.dataFRM.patchValue({ fromImage: res.name, repo: res.name });
        this.descriptions = res.description;
      }
    });
  }
}
