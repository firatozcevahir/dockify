import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { DataService } from '@app/shared/services/data-servcie';
import { Observable } from 'rxjs';
import { TutorVideoComponent } from '../video/tutor-video.component';

@Component({
  selector: 'tps-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss']
})
export class TutorialComponent implements OnInit {

  @ViewChild('accordion', { static: true }) Accordion: MatAccordion;

  panelOpenState = false;
  public accordionList$: Observable<any>;

  constructor(
    private dialog: MatDialog,
    private dataService: DataService) { }

  ngOnInit(): void {

    this.accordionList$ = this.dataService.getParametersData('DATA');
  }

  beforePanelClosed(panel): void {
    panel.isExpanded = false;
    console.log('Panel going to close!');
  }
  beforePanelOpened(panel): void {
    panel.isExpanded = true;
    console.log('Panel going to  open!');
  }

  afterPanelClosed(): void {
    console.log('Panel closed!');
  }
  afterPanelOpened(): void {
    console.log('Panel opened!');
  }


  closeAllPanels(): void {
    this.Accordion.closeAll();
  }

  openAllPanels(): void {
    this.Accordion.openAll();
  }

  public showVideo(item: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      record: item
    };
    dialogConfig.width = '650';
    dialogConfig.height = '650';
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    this.dialog.open(TutorVideoComponent, dialogConfig);
  }


}
