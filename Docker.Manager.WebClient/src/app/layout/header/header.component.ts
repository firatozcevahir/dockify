import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthenticationService } from '@app/shared/services/auth/authentication.service';
import { LANGUAGES } from '@languages/languages';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ChangePasswordComponent } from './change-password/change-password.component';

@Component({
  selector: 'tps-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Output() toggleSideBarForMe: EventEmitter<any> = new EventEmitter();

  public languages: any = [];
  public selectedlanguages: any = [];

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private auth: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.languages = LANGUAGES;
  }

  public toggleSideBar(): void {

    this.toggleSideBarForMe.emit();

    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 300);

  }

  public setLanguage($event): void {

    const language = $event.code.substring(0, 2);

    const DEFAULT_LOCALE = $event.code;

    this.translateService.use($event.key);

    // this.direction = $event.direction;

    moment.locale($event.key);

    localStorage.setItem('tagTracker_language', JSON.stringify($event));

  }

  public logout(): void {
    this.auth.logout(true);
  }

  public changePassword(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '40%';
    this.dialog.open(ChangePasswordComponent, dialogConfig);
  }

}
