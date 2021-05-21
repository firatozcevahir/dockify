import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwarmsComponent } from './swarms.component';

describe('SwarmsComponent', () => {
  let component: SwarmsComponent;
  let fixture: ComponentFixture<SwarmsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwarmsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwarmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
