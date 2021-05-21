import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DockerTemplateComponent } from './docker-template.component';


describe('DockerTemplateComponent', () => {
  let component: DockerTemplateComponent;
  let fixture: ComponentFixture<DockerTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DockerTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DockerTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
