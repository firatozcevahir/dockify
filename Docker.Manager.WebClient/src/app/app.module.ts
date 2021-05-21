import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ApplicationModule } from '@app/application/application.module';
import { IonicStorageModule } from '@ionic/storage';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AuthGuard } from '@shared/services/auth/auth-guard.service';
import { AuthenticationService } from '@shared/services/auth/authentication.service';
import { JwtHelperService } from '@shared/services/auth/jwt-helper.service';
import { DataService } from '@shared/services/data-servcie';
import { UiSwitchModule } from 'ngx-ui-switch';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { LayoutModule } from './layout/layout.module';
import { RegistryManagerModule } from './registry-manager/registry-manager.module';
import { SecurityModule } from './security/security.module';
import { SignalRService } from './shared/services/signalr.service';


// tslint:disable-next-line: typedef
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/languages/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    HttpClientModule,
    AppRoutingModule,

    IonicStorageModule.forRoot({
      name: '__cesargroupgDataStorage',
      driverOrder: ['indexeddb', 'sqlite', 'websql'],
    }),

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),

    UiSwitchModule.forRoot({
      size: 'medium',
      color: 'rgb(0, 189, 99)',
      switchColor: '#80FFA2',
      defaultBgColor: '#ffffff',
      defaultBoColor: '#476EFF',
      checkedLabel: 'yes',
      uncheckedLabel: 'no',
    }),

    ApplicationModule,
    DashboardModule,
    LayoutModule,
    SecurityModule,
    RegistryManagerModule
  ],
  providers: [
    TranslateService,
    SignalRService,
    DataService,
    JwtHelperService,
    AuthGuard,
    AuthenticationService,

    //   { provide: HTTP_INTERCEPTORS, useClass: AppInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
