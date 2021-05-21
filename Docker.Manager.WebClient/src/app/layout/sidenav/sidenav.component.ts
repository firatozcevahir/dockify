import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthenticationService } from '@app/shared/services/auth/authentication.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'tps-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit {
  mobileQuery: MediaQueryList;
  public sidenavWidth: number;
  public displayName: string;

  public isLoggedIn: boolean;

  private subscription: Subscription;
  private _mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private auth: AuthenticationService
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();

    //    this.mobileQuery.addListener(this._mobileQueryListener);

    this.subscription = this.auth.authStatus$.subscribe((status: any) => {
      if (status) {
        const authUser = this.auth.getAuthUser();
        this.displayName = authUser ? authUser.displayName : '';
      }
    });
  }

  ngOnInit(): void {
    this.sidenavWidth = 4;
    this.isLoggedIn = this.auth.isAuthUserLoggedIn();
  }

  increase(): void {
    this.sidenavWidth = 15;
  }
  decrease(): void {
    this.sidenavWidth = 4;
  }
}
