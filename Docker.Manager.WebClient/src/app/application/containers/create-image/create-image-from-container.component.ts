import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink';

@Component({
  selector: 'tps-create-image-from-container',
  templateUrl: './create-image-from-container.component.html',
  styleUrls: ['./create-image-from-container.component.scss']
})
export class CreateImageFromContainerComponent implements OnInit, OnDestroy {

  public dataFRM: FormGroup;

  public TITLE: string;
  public isRequesting: boolean;
  public descriptions: string;

  public networkList: any = [];

  private subs = new SubSink();

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialogModel: MatDialog,
    private dataservice: DataService,
    private snackBarService: SnackBarService,
    private translatorService: TranslatorService,
    private customEventService: CustomEventService
  ) { }

  ngOnInit(): void {
    this.createEmptyForm();
  }


  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private createEmptyForm(): void {
    this.dataFRM = this.fb.group({
      fromSrc: null,
      image: [null, Validators.compose([Validators.required, Validators.maxLength(100)])],
      domainname: [null, Validators.compose([Validators.maxLength(200)])],
      hostname: [null, Validators.compose([Validators.maxLength(200)])],

      cmd: null,
      env: null,
      volumes: null,
    });
  }


  public saveData(): void {

  }


}
