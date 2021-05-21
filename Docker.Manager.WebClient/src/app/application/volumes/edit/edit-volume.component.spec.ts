import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditVolumeComponent } from './edit-volume.component';

describe('EditVolumeComponent', () => {
  let component: EditVolumeComponent;
  let fixture: ComponentFixture<EditVolumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditVolumeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditVolumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
