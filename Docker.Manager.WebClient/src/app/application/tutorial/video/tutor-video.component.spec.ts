import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorVideoComponent } from './tutor-video.component';

describe('TutorVideoComponent', () => {
  let component: TutorVideoComponent;
  let fixture: ComponentFixture<TutorVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TutorVideoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
