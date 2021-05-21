import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { DataService } from '@app/shared/services/data-servcie';
import { SignalRService } from '@app/shared/services/signalr.service';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-exec',
  templateUrl: './exec.component.html',
  styleUrls: ['./exec.component.scss']
})
export class ExecComponent implements OnInit, OnDestroy {

  public execId: string;

  public isRequesting = false;
  public runningCmd: string = null;

  public rootCmd: string;
  public user: string;
  public isConnected = false;

  public cliLines: string[] = []
  public workingDir: string;


  public execResponse: any;

  private id: string;
  private subs = new SubSink();

  @ViewChild('consoleBody') private consoleBody: ElementRef;
  @ViewChild('cliInput') private cliInput: ElementRef<HTMLInputElement>;

  constructor(
    public dialogRef: MatDialogRef<ExecComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private dataservice: DataService,
    private snackbarService: SnackBarService,
    private translatorService: TranslatorService,
    private customEventService: CustomEventService,
    private signalRService: SignalRService
  ) {
    this.id = data.id;
  }

  ngOnInit(): void {
    // this.loadData();

    this.subs.add(this.customEventService
      .on('exec-response-update')
      .subscribe(() => { this.handleExecCommandResponse(); }),
      this.dialogRef.beforeClosed().subscribe(() => {
        this.killSIGINT();
        this.execCommand('exit');
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  public onClose(): void {
    this.dialogRef.close();
  }

  public scrollToBottom(): void {
    try {
      this.consoleBody?.nativeElement.scroll({
        top: this.consoleBody?.nativeElement.scrollHeight,
        left: 0,
        behavior: 'smooth'
      });

    } catch (err) { console.log(err); }
  }

  public execCreate(user: string, rootCmd: string) {
    this.cliLines = [];
    this.user = user && user.length > 0 ? user : 'root';
    this.rootCmd = rootCmd && rootCmd.length > 0 ? rootCmd : '/bin/bash';
    console.log('execCreate', this.id, this.user, this.rootCmd);
    this.isRequesting = true;
    this.subs.add(
      this.dataservice.GET_ANY<IDockerHubResponse>(`${'/docker/exec-create/'}${this.id}/${this.user}/${this.rootCmd}`)
        .pipe(
          finalize(() => {
            this.isRequesting = false;
          })
        )
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            this.execId = response.result;
            this.isConnected = true;
            this.snackbarService.openSuccessSnackBar(`Started Exec Instance ${this.execId}`);
            this.execCommand('pwd');
          } else {
            this.snackbarService.openErrorSnackBar(response.result);
          }
        }, (error) => {
          // HANDLE SERVER ERROR
        })
    );
  }

  public handleKeyPress($event: KeyboardEvent) {
    const target = ($event.target as HTMLInputElement);
    const cmd = target.value;
    const code = $event.code;

    switch (code) {
      case 'Enter':
        this.execCommand(cmd);
        target.value = '';
        break;
      case 'KeyC':
        if (($event.ctrlKey || $event.metaKey)) {
          this.killSIGINT();
        }
        break;
    }
  }

  public killSIGINT() {
    if (this.runningCmd === 'ping') {
      this.execCommand('kill -SIGINT `pgrep ' + this.runningCmd + '`');
    }
  }

  public execCommand(command: string) {
    this.isRequesting = true;
    this.subs.add(
      this.dataservice.GET_ANY<IDockerHubResponse>(`${'/docker/exec-start/'}${this.id}/${command}`)
        .pipe(
          finalize(() => {
            this.isRequesting = false;
          })
        )
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            this.execId = response.result;
          } else {
            this.snackbarService.openErrorSnackBar(response.result);
          }
        }, (error) => {
          // Server ERROR
        })
    );
  }

  public handleExecCommandResponse() {
    this.execResponse = this.signalRService.getExecResponse;


    console.log(this.execResponse);
    this.runningCmd = this.execResponse.runningCmd;

    switch (this.runningCmd) {
      case 'pwd':
        if (this.execResponse.result.length > 0) {
          this.workingDir = this.execResponse.result;
        }
        break;
      case 'exit':
        this.execCommand('kill -1 -1');
        this.isConnected = false;
        this.cliLines = [];
        break;
      case 'kill':
        this.runningCmd = null;
        break;
      case 'clear':
        this.cliLines = [];
        break;
    }

    if (this.execResponse.result.length === 0 || !this.execResponse) {
      return;
    }

    this.cliLines.push(this.execResponse.result);
    this.scrollToBottom();
    // console.log('response', this.execResponse);
  }

  focusCliInput(){
    this.cliInput.nativeElement.focus();
  }
}
