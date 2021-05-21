import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveSwarmComponent } from './leave-swarm.component';

describe('LeaveSwarmComponent', () => {
  let component: LeaveSwarmComponent;
  let fixture: ComponentFixture<LeaveSwarmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeaveSwarmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveSwarmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
