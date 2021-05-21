import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PushToRegistryComponent } from './push-to-registry.component';

describe('PushToRegistryComponent', () => {
  let component: PushToRegistryComponent;
  let fixture: ComponentFixture<PushToRegistryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PushToRegistryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PushToRegistryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
