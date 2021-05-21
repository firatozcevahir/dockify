import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tps-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit {
  public sideBarOpen: boolean;

  constructor() {
    this.sideBarOpen = false;
  }

  ngOnInit(): void {}

  public sideBarToggler($event): void {
    this.sideBarOpen = !this.sideBarOpen;
  }
}
