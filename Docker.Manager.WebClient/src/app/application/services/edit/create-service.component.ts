
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { IDockerImages } from '@app/application/interfaces/docker-images.interface';
import { IDockerRegistry } from '@app/application/interfaces/docker-registry.interface';
import { IErrorResponse } from '@app/shared/interfaces/IErrorResponse';
import { IRequestData } from '@app/shared/interfaces/IRequestData';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink/index';
import { slideInOutAnimation } from '@app/shared/_animations';
import { Observable } from 'rxjs';
import { finalize, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'tps-create-service',
  templateUrl: './create-service.component.html',
  styleUrls: ['./create-service.component.scss'],

  encapsulation: ViewEncapsulation.None,
  animations: [slideInOutAnimation],
  // tslint:disable-next-line: no-host-metadata-property
  host: { '[@slideInOutAnimation]': '' },
})
export class CreateServiceComponent implements OnInit, OnDestroy {
  public dataFRM: FormGroup;

  public groupList$: Observable<any>;
  public TITLE: string;
  public isRequesting: boolean;
  public ncpu: any;
  public nmem: any;

  public dockerRegistryList: IDockerRegistry[] = [];
  public images: string[] = [];
  public filteredImages: Observable<string[]>;

  public companyList: any[] = [];

  public resources = { memory: 0, memoryReservation: 0, nanoCpus: 0 };

  private subs = new SubSink();

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dataservice: DataService,
    private snackBarService: SnackBarService,

    private translatorService: TranslatorService,
    private customEventService: CustomEventService
  ) { }

  ngOnInit(): void {
    this.createEmptyForm();
    this.TITLE = this.translatorService.getTranslated('SYSTEM.RECORD.STATE_INSERT');
    this.loadParameters();
    this.loadSystemInfo();
    this.loadCompanies();

    // this.subs.add(
    //   this.dataservice.broadcastGlobalSystemInfo.subscribe(data => {
    //     if (data) {
    //       this.ncpu = data.ncpu;
    //       this.nmem = this.formatBytes( data.memTotal );
    //     }
    //   })
    // );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  formatLabel(value: number): number {
    return value;
  }

  public formatBytes(bytes, decimals = 0): number {
    if (bytes === 0) {
      return 0;
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)); // + ' ' + sizes[i];
  }

  private createEmptyForm(): void {
    this.dataFRM = this.fb.group({
      fromSrc: null,
      image: null,
      company: null,
      name: [null, Validators.maxLength(200)],
      replicated: 1,
      ports: [null],
      tty: false,
      workingDir: null,
      cmd: null,
      args: null,
      env: null,
      binds: null,
      memoryReservation: 0,
      memory: 0,
      nanoCpusReservation: 0,
      nanoCpus: 0,
      updateParallelism: 1,
      updateDelay: 0,
      updateFailureAction: null,
      updateOrder: null,
      restartCondition: null,
      restartDelay: 5000000000,
      restartMaxAttempts: 1,
      restartWindow: 0
    });
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.dataFRM.controls[controlName].hasError(errorName);
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

  public loadCompanies(): void {
    this.subs.add(
      this.dataservice
        .GET_ANY<IRequestData>(`${'/company/active'}`)
        .subscribe((results: any) => {
          this.companyList = results.items;
        })
    );
  }

  // tslint:disable-next-line: typedef
  public async saveData() {
    try {
      this.isRequesting = true;

      this.subs.add(
        this.dataservice
          .SAVE<IErrorResponse>(`${'/docker/create-service'}`, this.dataFRM.value)
          .pipe(
            finalize(() => {
              this.isRequesting = false;
            })
          )
          .subscribe(
            (response: IDockerHubResponse) => {

              if (response.success) {
                this.isRequesting = false;

                this.customEventService.publish('service-updated');
                this.router.navigate(['/app/services']);
                this.snackBarService.openSuccessSnackBar(
                  this.translatorService.getTranslated('SYSTEM.RECORD.PROCESS_COMPLETED')
                );
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
}
