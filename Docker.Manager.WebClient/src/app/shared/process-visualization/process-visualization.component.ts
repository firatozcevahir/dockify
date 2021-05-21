import { Component, OnInit } from '@angular/core';
import { SubSink } from '../subsink';
import { CustomEventService } from '../services/custom-event.service';
import { SignalRService } from '../services/signalr.service';
import { IImageProgress } from '@app/application/interfaces/image-progress.interface';

@Component({
  selector: 'tps-process-visualization',
  templateUrl: './process-visualization.component.html',
  styleUrls: ['./process-visualization.component.scss']
})
export class ProcessVisualizationComponent implements OnInit {

  public imageProgressData: IImageProgress[];

  private subs = new SubSink();
  constructor(
    private customEventService: CustomEventService,
    private signalRService: SignalRService
  ) {
    this.imageProgressData = JSON.parse(localStorage.getItem('imageprogressdata'));
    if (!this.imageProgressData) {
      this.imageProgressData = [];
    }
  }

  ngOnInit(): void {
    this.subs.add(this.customEventService
      .on('image-progress-update')
      .subscribe(() => { this.handleImageProgressData(); })
    );
  }

  public handleImageProgressData(): void {
    // const imageProgress = this.signalRService.getImageProgressData;
    // const index = this.imageProgressData.findIndex((a) => a.id === imageProgress.id);
    // if (index > -1) {
    //   this.imageProgressData[index] = imageProgress;
    // } else {
    //   this.imageProgressData.push(imageProgress);
    // }

    // localStorage.setItem('imageprogressdata', JSON.stringify(this.imageProgressData));

    // if (this.imageProgressData.findIndex((e) => e.progressMessage?.startsWith('Status:') || e.progressMessage?.startsWith('Digest:') )) {
    //   localStorage.removeItem('imageprogressdata');
    //   setTimeout(() => {
    //     this.imageProgressData = [];
    //   }, 8000);
    // }
    // console.log('IMAGE PROGRESS DATA', this.imageProgressData);
    // console.log('image progress data', this.imageProgressData);
  }

}
