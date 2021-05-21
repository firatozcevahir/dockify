import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckTutorial } from '@app/shared/services/check-tutorial.service';
import { TranslateModule } from '@ngx-translate/core';
import { FilterPipe } from '@shared/pipe/filter.pipe';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { ModalDialogsModule } from './dialogs/modal-dialogs.module';
import { MyEchartsDirective } from './directives/my-echarts.directive';
import { MaterialModule } from './material.module';
import { DateFormatPipe } from './pipe/date-format.pipe';
import { DateTimeFormatPipe } from './pipe/datetime-format.pipe';
import { FormatBytesPipe } from './pipe/format-bytes.pipe';
import { SanitizeHtmlPipe } from './pipe/sanitize-html.pipe';
import { FormatUrlPipe } from './pipe/format-url.pipe';
import { KeyValuePairPipe } from './pipe/keyvaluepair.pipe';
import { TimeAgoPipe } from './pipe/time-ago.pipe';
import { ProcessVisualizationComponent } from './process-visualization/process-visualization.component';
import { SnackBarService } from './services/snack-bar.service';
import { TranslateMatPaginatorService } from './services/translateMatPaginator.service';
import { TooltipComponent } from './components/tooltip/tooltip.component';


@NgModule({
  declarations: [

    FilterPipe,
    TimeAgoPipe,
    DateFormatPipe,
    DateTimeFormatPipe,
    FormatBytesPipe,
    SanitizeHtmlPipe,
    FormatUrlPipe,
    KeyValuePairPipe,
    MyEchartsDirective,
    ProcessVisualizationComponent,
    SearchBarComponent,
    TooltipComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    FlexLayoutModule,

    TranslateModule,
    MaterialModule,
    ModalDialogsModule,
  ],
  exports: [
    CommonModule,

    FilterPipe,
    TimeAgoPipe,
    DateFormatPipe,
    DateTimeFormatPipe,
    FormatBytesPipe,
    SanitizeHtmlPipe,
    FormatUrlPipe,
    KeyValuePairPipe,
    MyEchartsDirective,
    ProcessVisualizationComponent,
    SearchBarComponent,
    TooltipComponent
  ],
  providers: [TranslateMatPaginatorService, SnackBarService, CheckTutorial],

})
export class SharedModule {

  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [],
    };
  }

}
