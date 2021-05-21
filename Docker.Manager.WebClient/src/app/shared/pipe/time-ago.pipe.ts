import { ChangeDetectorRef, NgZone, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { TranslatorService } from './../services/translator.service';

@Pipe({
  name: 'timeAgo',
  pure: false
})
export class TimeAgoPipe implements PipeTransform, OnDestroy {

  private timer: number;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private translatorService: TranslatorService
  ) { }

  transform(value: string): any {
    this.removeTimer();
    const d = new Date(value);
    const now = new Date();
    const seconds = Math.round(Math.abs((now.getTime() - d.getTime()) / 1000));
    const timeToUpdate = this.getSecondsUntilUpdate(seconds) * 1000;

    this.timer = this.ngZone.runOutsideAngular(() => {
      if (typeof window !== 'undefined') {
        return window.setTimeout(() => {
          this.ngZone.run(() => this.changeDetectorRef.markForCheck());
        }, timeToUpdate);
      }
      return null;
    });
    const minutes = Math.round(Math.abs(seconds / 60));
    const hours = Math.round(Math.abs(minutes / 60));
    const days = Math.round(Math.abs(hours / 24));
    const months = Math.round(Math.abs(days / 30.416));
    const years = Math.round(Math.abs(days / 365));

    if (seconds <= 45) {
      return this.translatorService.getTranslated('TIME_AGO.SEC_45');
    } else if (seconds <= 90) {
      return this.translatorService.getTranslated('TIME_AGO.SEC_90');
    } else if (minutes <= 45) {
      return minutes + this.translatorService.getTranslated('TIME_AGO.MIN_45');
    } else if (minutes <= 90) {
      return this.translatorService.getTranslated('TIME_AGO.MIN_90');
    } else if (hours <= 22) {
      return hours + this.translatorService.getTranslated('TIME_AGO.HR_22');
    } else if (hours <= 36) {
      return this.translatorService.getTranslated('TIME_AGO.HR_36');
    } else if (days <= 25) {
      return days + this.translatorService.getTranslated('TIME_AGO.DAY_25');
    } else if (days <= 45) {
      return this.translatorService.getTranslated('TIME_AGO.DAY_45');
    } else if (days <= 345) {
      return months + this.translatorService.getTranslated('TIME_AGO.DAY_345');
    } else if (days <= 545) {
      return this.translatorService.getTranslated('TIME_AGO.DAY_545');
    } else {
      // (days > 545)
      return years + this.translatorService.getTranslated('TIME_AGO.YEAR');
    }

  }
  ngOnDestroy(): void {
    this.removeTimer();
  }
  private removeTimer(): void {
    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }
  private getSecondsUntilUpdate(seconds: number): 2 | 30 | 300 | 3600 {
    const min = 60;
    const hr = min * 60;
    const day = hr * 24;
    if (seconds < min) {
      // less than 1 min, update ever 2 secs
      return 2;
    } else if (seconds < hr) {
      // less than an hour, update every 30 secs
      return 30;
    } else if (seconds < day) {
      // less then a day, update every 5 mins
      return 300;
    } else {
      // update every hour
      return 3600;
    }
  }


}
