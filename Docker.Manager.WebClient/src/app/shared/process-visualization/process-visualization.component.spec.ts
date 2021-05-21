import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessVisualizationComponent } from './process-visualization.component';

describe('ProcessVisualizationComponent', () => {
  let component: ProcessVisualizationComponent;
  let fixture: ComponentFixture<ProcessVisualizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessVisualizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
