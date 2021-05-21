import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { SignalRService } from './shared/services/signalr.service';

@Component({
  selector: 'tps-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public DEFAULT_LOCALE: any;

  constructor(private translateService: TranslateService, private signalrService: SignalRService) { }

  ngOnInit(): void {
    this.initTranslate();
    this.disableMobileTouch();
    this.signalrService.createConnection();
  }

  private initTranslate(): void {
    this.translateService.addLangs(['tr', 'en', 'ar']);
    this.translateService.setDefaultLang('tr');

    const browserLang = this.translateService.getBrowserLang() || 'tr';

    const browserCultureLang = this.translateService.getBrowserCultureLang();
    let DEF_LOCALE: any = 'tr';

    if (browserLang) {
      this.translateService.setDefaultLang(browserLang);

      if (browserLang === 'zh') {
        if (browserCultureLang.match(/-CN|CHS|Hans/i)) {
          this.translateService.use('zh-cmn-Hans');
        } else if (browserCultureLang.match(/-TW|CHT|Hant/i)) {
          this.translateService.use('zh-cmn-Hant');
        }
      } else {
        this.translateService.use(browserLang);
      }

      this.DEFAULT_LOCALE = browserCultureLang || 'tr-TR';

      DEF_LOCALE = browserLang;
    } else {
      this.translateService.use(DEF_LOCALE);
    }

    moment.locale(DEF_LOCALE);
  }

  private disableMobileTouch(): void {
    let lastTouchEnd = 0;

    document.addEventListener(
      'touchend',
      (event) => {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      },
      false
    );
  }
}
