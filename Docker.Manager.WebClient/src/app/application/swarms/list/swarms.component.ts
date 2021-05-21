import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IDockerSwarmNode } from '@app/application/interfaces/docker-swarm-nodes.interface';
import { CustomEventService } from '@app/shared/services/custom-event.service';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { TranslatorService } from '@app/shared/services/translator.service';
import { SubSink } from '@app/shared/subsink/index';
import { combineLatest } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { CreateSwarmComponent } from '../create/create-swarm.component';
import { InspectSwarmComponent } from '../inspect/inspect-swarm.component';
import { NodeDetailsComponent } from '../node-details/node-details.component';

@Component({
  selector: 'tps-swarms',
  templateUrl: './swarms.component.html',
  styleUrls: ['./swarms.component.scss']
})
export class SwarmsComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  swarmNod: IDockerSwarmNode[] = [];


  public InspectSwarm: any = [];
  public dataSource = new MatTableDataSource<IDockerSwarmNode>();

  public managerToken: string;
  public workerToken: string;
  public displayedColumns: string[] = ['id', 'description', 'managerStatus', 'spec', 'status', 'createdAt', 'updatedAt'];

  public itemCount: number;
  public dashbaordDatasource: any = {};
  public searchTerm: string;
  public isRequesting = false;
  public isServerError = false;
  public showTitle: false;
  public showGraph: false;

  public nodeInfo: any = { totalCpu: 0, totalMemory: 0 };
  public swarmGraphOptions: any = {};

  private subs = new SubSink();

  constructor(
    private dialog: MatDialog,
    private dataservice: DataService,
    private customEventService: CustomEventService,
    private translatorService: TranslatorService,
    private snackBarService: SnackBarService
  ) {

    this.subs.add(
      this.customEventService.on('swarm-updated').subscribe(() => this.loadData())
    );

  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  public onSearchClear(): void {
    this.searchTerm = '';
  }

  public loadData(): void {
    this.isRequesting = true;
    this.isServerError = false;
    this.subs.add(
      // tslint:disable-next-line: deprecation
      combineLatest(

        this.dataservice.GET_ANY<IDockerSwarmNode>(`${'/docker/list-swarm-node'}`),
        this.dataservice.GET_ANY<any>(`${'/docker/inspect-swarm/'}`)

      ).pipe(
        finalize(() => {
          this.isRequesting = false;
        })
      )
        // tslint:disable-next-line: no-shadowed-variable
        .subscribe(([swarmNode, swarmInspect]
        ) => {

          this.InspectSwarm = swarmInspect;
          this.managerToken = this.InspectSwarm.result.joinTokens.manager;
          this.workerToken = this.InspectSwarm.result.joinTokens.worker;

          this.InspectSwarm = swarmNode;

          this.isRequesting = false;
          this.dataSource = new MatTableDataSource<IDockerSwarmNode>(this.InspectSwarm.result);
          this.swarmGraphOptions = this.getSwarmGraphOptions();
          this.nodeInfo = {
            totalCpu: (this.InspectSwarm.result.reduce((a, b) => a + b.description.resources.nanoCPUs, 0) / 1000000000),
            totalMemory: this.InspectSwarm.result.reduce((a, b) => a + b.description.resources.memoryBytes, 0),
          };

          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;

        }, (error) => {
          // server error (docker daemon or server)
          this.isServerError = true;
          this.snackBarService.openErrorSnackBar(
            this.translatorService.getTranslated('SYSTEM.SERVER_ERROR')
          );
        })

    );

  }

  public getId(id: string): string {
    return id.substr(7, 12);
  }

  public pageChanged(event): void { }

  // public delete(item: any): void {

  //   this.dataservice.processRecordWithUndo(
  //     this.translatorService.getTranslated('SYSTEM.RECORD.IS_DELETING'), '/docker/delete-image', item, 'swarm-updated'
  //   );

  // }

  public createNewSwarm(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '60%';
    this.dialog.open(CreateSwarmComponent, dialogConfig);
  }

  public inspectProcess(item: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { record: item, url: '/docker/inspect-swarm-node/', title: item.name };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '60%';
    this.dialog.open(NodeDetailsComponent, dialogConfig);
  }

  public inspectSwarm(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { url: '/docker/inspect-swarm/', };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '60%';
    this.dialog.open(InspectSwarmComponent, dialogConfig);
  }

  public unlockSwarm(item: any): void {
    // console.log(item);
  }

  public getSwarmGraphOptions(): any {

    const nodes = this.InspectSwarm.result.filter((node) => node.status.state === 'ready');
    return {
      tooltip: {
        formatter: (e) => {
          let res = '';
          e.seriesName === 'CPU' ?
            res =
            `
              <b>${e.name}</b> <br>
              ${this.translatorService.getTranslated('APPLICATIONS.SWARM.NODE.CPU')}:
              ${e.value}
            `
            :
            res =
            `
              <b>${e.name}</b> <br>
              ${this.translatorService.getTranslated('APPLICATIONS.SWARM.NODE.MEMORY')}:
              ${this.formatBytes(e.value, 2)} ${e.percent}%
            `;
          return res;
        }
      },
      legend: {
        data: nodes.map((node) => ({ name: node.id })),
        formatter: (id) => {
          return nodes.find((node) => node.id === id).description.hostname;
        }
      },
      series: [
        {
          name: 'CPU',
          type: 'pie',
          radius: 70,
          center: ['35%', '45%'],
          avoidLabelOverlap: true,
          label: {
            show: true,
            formatter: (e) => {
              return nodes.find((node) => node.id === e.name).description.hostname;
            }
          },
          data: nodes.map((node) => {
            return {
              value: (node.description.resources.nanoCPUs / 1000000000),
              name: `${node.id}`
            };
          }),
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2
          }
        },
        {
          name: 'MEMORY',
          type: 'pie',
          radius: 70,
          center: ['65%', '45%'],
          avoidLabelOverlap: true,
          label: {
            show: true,
            formatter: (e) => {
              return nodes.find((node) => node.id === e.name).description.hostname;
            }
          },
          data: nodes.map((node) => {
            return {
              value: node.description.resources.memoryBytes,
              name: `${node.id}`
            };
          }),
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2
          }
        }
      ]
    };
  }

  public formatBytes(bytes, decimals = 0): string {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

}
