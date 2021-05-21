import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolumeGraphComponent } from './volume-graph.component';

describe('VolumeGraphComponent', () => {
  let component: VolumeGraphComponent;
  let fixture: ComponentFixture<VolumeGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VolumeGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VolumeGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
