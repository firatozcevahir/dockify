import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShellscriptsComponent } from './shellscripts.component';

describe('ShellscriptsComponent', () => {
  let component: ShellscriptsComponent;
  let fixture: ComponentFixture<ShellscriptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShellscriptsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShellscriptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
