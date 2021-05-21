import { ComponentFixture, TestBed } from '@angular/core/testing';

import { K8Component } from './k8.component';

describe('K8Component', () => {
  let component: K8Component;
  let fixture: ComponentFixture<K8Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ K8Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(K8Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
