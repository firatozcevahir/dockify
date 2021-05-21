import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditShellscriptsComponent } from './edit-shellscripts.component';

describe('EditShellscriptsComponent', () => {
  let component: EditShellscriptsComponent;
  let fixture: ComponentFixture<EditShellscriptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditShellscriptsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditShellscriptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
