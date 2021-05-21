import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerDirectoriesComponent } from './container-directories.component';

describe('ContainerDirectoriesComponent', () => {
  let component: ContainerDirectoriesComponent;
  let fixture: ComponentFixture<ContainerDirectoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContainerDirectoriesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerDirectoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
