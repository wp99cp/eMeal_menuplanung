import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSettingsPageComponent } from './app-settings-page.component';

describe('AppSettingsPageComponent', () => {
  let component: AppSettingsPageComponent;
  let fixture: ComponentFixture<AppSettingsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppSettingsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppSettingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
