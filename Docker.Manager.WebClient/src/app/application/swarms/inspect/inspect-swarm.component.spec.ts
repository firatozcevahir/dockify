import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectSwarmComponent } from './inspect-swarm.component';

describe('InspectSwarmComponent', () => {
  let component: InspectSwarmComponent;
  let fixture: ComponentFixture<InspectSwarmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InspectSwarmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InspectSwarmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
