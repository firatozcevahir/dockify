import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinSwarmComponent } from './join-swarm.component';

describe('JoinSwarmComponent', () => {
  let component: JoinSwarmComponent;
  let fixture: ComponentFixture<JoinSwarmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JoinSwarmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinSwarmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
