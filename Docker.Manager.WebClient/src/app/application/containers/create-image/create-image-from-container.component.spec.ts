import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateImageFromContainerComponent } from './create-image-from-container.component';

describe('CreateImageFromContainerComponent', () => {
  let component: CreateImageFromContainerComponent;
  let fixture: ComponentFixture<CreateImageFromContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateImageFromContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateImageFromContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
