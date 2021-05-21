import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DockerManagerComponent } from './docker-manager.component';

describe('DockerManagerComponent', () => {
  let component: DockerManagerComponent;
  let fixture: ComponentFixture<DockerManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DockerManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DockerManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
