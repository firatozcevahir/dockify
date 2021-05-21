import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageGraphComponent } from './image-graph.component';

describe('ImageGraphComponent', () => {
  let component: ImageGraphComponent;
  let fixture: ComponentFixture<ImageGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
