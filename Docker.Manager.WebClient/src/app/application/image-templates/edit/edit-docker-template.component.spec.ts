import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDockerTemplateComponent } from './edit-docker-template.component';

describe('EditDockerTemplateComponent', () => {
  let component: EditDockerTemplateComponent;
  let fixture: ComponentFixture<EditDockerTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDockerTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDockerTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
