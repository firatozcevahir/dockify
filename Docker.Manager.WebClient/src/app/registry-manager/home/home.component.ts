import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IDockerHubResponse } from '@app/application/interfaces/docker-hub-response.interface';
import { DataService } from '@app/shared/services/data-servcie';
import { SnackBarService } from '@app/shared/services/snack-bar.service';
import { SubSink } from '@app/shared/subsink';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'tps-registry-manager-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  public isRequesting = false;

  public repositories: { reponame: string, tags: string[], isRequestingTags: boolean }[] = [];

  private repos: { reponame: string, tags: string[], isRequestingTags: boolean }[] = [];
  private subs = new SubSink();

  public searchTerm: string;
  @ViewChild('searchBar') searchBar: any;

  constructor(
    private dataService: DataService,
    private snackBarService: SnackBarService
  ) { }

  ngOnInit(): void {
    this.loadRegistryCatalogs();

    this.subs.add(this.dataService.broadcastSearchTerms.subscribe(data => {
      this.searchTerm = data;
      this.applyFilter();
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  public loadRegistryCatalogs(): void {
    this.isRequesting = true;
    this.subs.add(
      this.dataService.GET_ANY<any>(`${'/docker-registry/get-catalog'}`)
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {

            this.isRequesting = false;
            this.repositories = response.result.map((res) => {
              return {
                reponame: res,
                tags: null
              };
            });
            this.repos = this.repositories;
            this.applyFilter();
          }
          else {
            this.snackBarService.openErrorSnackBar(response.result);
          }
        })
    );
  }

  public applyFilter(): void {
    this.repositories = this.repos.filter((r) => r.reponame.toLowerCase().includes(this.searchTerm.trim().toLowerCase()));
  }

  public getRegistryCatalogTags(item: any): void {
    const repo = this.repositories.find((repository) => repository.reponame === item.reponame);
    if (!repo) { return; }
    repo.isRequestingTags = true;
    repo.tags = [];
    const url = `${'/docker-registry/get-catalog-tag/'}${(item.reponame as string).replace('/', '%2F')}`;

    this.subs.add(
      this.dataService.GET_ANY<any>(url)
      .pipe(
        finalize(() => {
          repo.isRequestingTags = false;
        })
      )
        .subscribe((response: IDockerHubResponse) => {
          if (response.success) {
            repo.tags = response.result;
          } else {
            this.snackBarService.openErrorSnackBar(response.result);
          }
        })
    );
  }

  public deleteImageFromRegistry(item: any): void {


  }

}
