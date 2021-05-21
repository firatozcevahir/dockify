import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSwarmComponent } from './update-swarm.component';

describe('UpdateSwarmComponent', () => {
  let component: UpdateSwarmComponent;
  let fixture: ComponentFixture<UpdateSwarmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateSwarmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateSwarmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
