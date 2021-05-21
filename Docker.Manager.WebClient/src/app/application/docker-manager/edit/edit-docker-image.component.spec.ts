import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDockerImageComponent } from './edit-docker-image.component';

describe('EditDockerImageComponent', () => {
  let component: EditDockerImageComponent;
  let fixture: ComponentFixture<EditDockerImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDockerImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDockerImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
