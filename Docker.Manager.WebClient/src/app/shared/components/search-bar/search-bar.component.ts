import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '@app/shared/services/data-servcie';

@Component({
  selector: 'tps-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {

  @ViewChild('searchBar') searchBar: any;

  public searchTerm: string;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {

    this.dataService.broadcastSearchTerms.subscribe((data) =>{
      this.searchTerm = data;
    });

    // setTimeout(() => {
    //   this.searchBar.focus();
    // }, 300);
  }


  public applyFilter(): void {
    this.dataService.globalSearchTerms.next(this.searchTerm.trim().toLowerCase());
  }

}
