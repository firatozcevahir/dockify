import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerGraphComponent } from './container-graph.component';

describe('ContainerGraphComponent', () => {
  let component: ContainerGraphComponent;
  let fixture: ComponentFixture<ContainerGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContainerGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
