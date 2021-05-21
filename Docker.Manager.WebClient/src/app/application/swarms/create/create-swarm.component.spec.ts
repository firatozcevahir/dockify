import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSwarmComponent } from './create-swarm.component';

describe('CreateSwarmComponent', () => {
  let component: CreateSwarmComponent;
  let fixture: ComponentFixture<CreateSwarmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateSwarmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSwarmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
