import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerStatsComponent } from './container-stats.component';

describe('ContainerStatsComponent', () => {
  let component: ContainerStatsComponent;
  let fixture: ComponentFixture<ContainerStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContainerStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
