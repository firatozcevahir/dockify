
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSlider } from '@angular/material/slider';
import { Router } from '@angular/router';
import { ImageSelectorComponent } from '@app/application/image-selector/image-selector.component';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { IDockerImages } from '@app/application/interfaces/docker-images.interface';
import { IDockerNetwork } from '@app/application/interfaces/docker-network.interface';
import { IDockerRegistry } from '@app/application/interfaces/docker-registry.interface';
import { IDockerSearchImage } from '@app/application/interfaces/docker-search.interface';
import { IImageProgress } from '@app/application/interfaces/image-progress.interface';
import { MyConstants } from '@app/shared/constants/constants';
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
  selector: 'tps-edit-container',
  templateUrl: './edit-container.component.html',
  styleUrls: ['./edit-container.component.scss'],

  encapsulation: ViewEncapsulation.None,
  animations: [slideInOutAnimation],
  // tslint:disable-next-line: no-host-metadata-property
  host: { '[@slideInOutAnimation]': '' },
})
export class EditContainerComponent implements OnInit, OnDestroy {
  public dataFRM: FormGroup;

  public resources = { memory: 0, memoryReservation: 0, nanoCpus: 0 };
  public imageProgressData: IImageProgress;

  public restartPolicy$: Observable<any>;
  public groupList$: Observable<any>;
  public TITLE: string;
  public isRequesting: boolean;
  public descriptions: string;
  public companyList: any[] = [];

  public appTemplates: any[] = [];

  public networkList: any = [];
  public tagType$: Observable<any>;
  public selectedGroup: any = [];
  public dockerRegistryList: IDockerRegistry[] = [];
  public images: string[] = [];
  public filteredImages: Observable<string[]>;

  private subs = new SubSink();

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialogModel: MatDialog,
    private dataservice: DataService,
    private snackBarService: SnackBarService,
    private translatorService: TranslatorService,
    private customEventService: CustomEventService,
    private signalRService: SignalRService
  ) { }

  ngOnInit(): void {
    this.getAppTemplates();
    this.createEmptyForm();
    this.loadParameters();
    this.loadCompanies();
    this.loadSystemInfo();

    this.restartPolicy$ = this.dataservice.getParametersByItem('RESTART_POLICY');
    this.TITLE = this.translatorService.getTranslated('SYSTEM.RECORD.STATE_INSERT');

    this.subs.add(
      this.dataservice
        .GET_ANY<IDockerNetwork>(`${'/docker/list-networks'}`)
        .subscribe((response: IDockerHubResponse) => {
          this.networkList = response.result;
        })
    );

    this.subs.add(this.customEventService
      .on('image-progress-update')
      .subscribe(() => { this.handleImageProgressData(); })
    );

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  public loadCompanies(): void {
    this.subs.add(
      this.dataservice
        .GET_ANY<IRequestData>(`${'/company/active'}`)
        .subscribe((results: any) => {
          this.companyList = results.items;
        })
    );
  }

  private createEmptyForm(): void {
    this.dataFRM = this.fb.group({
      appTemplate: null,
      fromSrc: null,
      company: null,
      image: [null, Validators.compose([Validators.required, Validators.maxLength(100)])],
      alwaysPullImage: true,
      name: [null, Validators.maxLength(200)],
      domainname: [null, Validators.compose([Validators.maxLength(200)])],
      hostname: [null, Validators.compose([Validators.maxLength(200)])],
      macAddress: [null, Validators.compose([Validators.pattern(MyConstants.MAC_ADDRESS), Validators.maxLength(20)])],
      workingDir: null,
      argsEscaped: false,
      networkDisabled: false,
      dnsName: [null],
      tty: false,
      startContainer: true,
      autoUpdate: true,
      ports: [null],
      storagePath: [null],
      restartPolicy: 'Undefined',
      cmd: null,
      entryPoint: null,
      env: null,
      binds: null,
      links: null,
      networkMode: 'bridge',
      myVolumes: null,
      isProtected: false,
      publishAllPorts: true,
      privileged: false,
      readonlyRootfs: false,
      autoRemove: false,
      memoryReservation: 0,
      memory: 0,
      nanoCpus: 0
      // environments: this.fb.array([])
    });
  }

  private loadSystemInfo(): void {
    this.subs.add(
      this.dataservice.GET_ANY<any>(`${'/docker/system-info'}`)
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            this.resources = {
              nanoCpus: response.result.ncpu,
              memory: response.result.memTotal,
              memoryReservation: response.result.memTotal
            };
            this.dataservice.globalSystemInfo.next(response.result);
          }
          else {
            this.snackBarService.openErrorSnackBar(response.result);
          }
        })
    );
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

                  this.filteredImages = this.dataFRM.controls.image.valueChanges.pipe(
                    startWith(''),
                    map(value => this._filter(value))
                  );

                  response.result.forEach(image => {
                    image.repoTags?.filter((a) => a !== '<none>:<none>').forEach((repoTag: string) => {
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
    const selectedRegistry = this.dataFRM.controls.fromSrc.value;
    const selectedRegistryUrl = this.formatUrl(selectedRegistry.registryUrl);

    this.filteredImages = this.dataFRM.controls.image.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    const selectedRegistry = this.dataFRM.controls.fromSrc.value;
    const selectedRegistryUrl = this.formatUrl(selectedRegistry.registryUrl);
    const isDockerRegistry = selectedRegistryUrl.includes('docker.io');
    if (isDockerRegistry) {
      return this.images
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

  public onImgError($event: any): void {
    const imgElem = ($event.target as HTMLImageElement);
    const parentElem = imgElem.parentElement;
    parentElem.style.backgroundImage = 'url("./assets/images/noimage.png")';
    imgElem.src = './assets/images/noimage.png';
  }

  public searchForImage(): void {
    if (
      this.dataFRM.controls.image.value === null ||
      this.dataFRM.controls.image.value === undefined
    ) {
      return;
    }

    this.subs.add(
      this.dataservice
        .SAVE<IDockerSearchImage>(
          `${'/docker/search-image/'}`,
          {
            searchTerm: this.dataFRM.controls.image.value,
            dockerRegistry: this.dataFRM.controls.fromSrc.value
          }
        )
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

        }, (error) => {
          this.snackBarService.openErrorSnackBar(error.message);
        })
    );
  }

  public async saveData(): Promise<void> {
    try {
      if (this.dataFRM.controls.publishAllPorts.value) {
        this.dataFRM.controls.ports.setValue(null);
      }

      this.isRequesting = true;
      this.subs.add(
        this.dataservice
          .SAVE<IErrorResponse>(`${'/docker/create-container'}`, this.dataFRM.value)
          .pipe(
            finalize(() => {
              this.isRequesting = false;
            })
          )
          .subscribe(
            (response: IDockerHubResponse) => {

              if (response.success) {
                this.isRequesting = false;

                this.customEventService.publish('record-updated');
                this.router.navigate(['/app/docker-containers']);

                this.snackBarService.openSuccessSnackBar(this.translatorService.getTranslated('SYSTEM.ACTION.CON_CREATE_SUCCESS'));
              } else {
                this.snackBarService.openErrorSnackBar(response.result);
              }
            },
            (error) => {
              this.isRequesting = false;
            }
          )
      );
    } catch (error) { }
  }

  public getAppTemplates(): void {
    this.subs.add(
      this.dataservice
        .GET_ANY<IRequestData>(`${'/app-template/getActive'}`)
        .subscribe((results: any) => {
          this.appTemplates = results.items;
        })
    );
  }

  public handleTemplateChange(item: any): void {
    this.dataFRM.patchValue(item);
  }

  private OpenHubImageList(item: any): void {

    const dialogConf = new MatDialogConfig();
    dialogConf.data = {
      record: item,
      title: this.dataFRM.controls.image.value,
    };
    dialogConf.disableClose = true;
    dialogConf.autoFocus = true;
    dialogConf.width = '40%';
    this.dialogModel.open(ImageSelectorComponent, dialogConf).afterClosed().subscribe(res => {

      if (res) {
        this.dataFRM.controls.name.setValue(res.name);
        this.descriptions = res.description;
      }

    });
  }

  public handleMemoryReserv(slider: MatSlider): void {
    // if (slider.value > this.dataFRM.controls.memory.value) {
    //   this.dataFRM.controls.memory.setValue(slider.value);
    // }
  }

  public handleMemoryLimit(slider: MatSlider): void {
    // if (slider.value < this.dataFRM.controls.memoryReservation.value) {
    //   this.dataFRM.controls.memoryReservation.setValue(slider.value);
    // }
  }

  public handleImageProgressData(): void {
    this.imageProgressData = this.signalRService.getImageProgressData;
  }

}
