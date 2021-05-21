import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSettingComponent } from './edit-setting.component';

describe('EditSettingComponent', () => {
  let component: EditSettingComponent;
  let fixture: ComponentFixture<EditSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
