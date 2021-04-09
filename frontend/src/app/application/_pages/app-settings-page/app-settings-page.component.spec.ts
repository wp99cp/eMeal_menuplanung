import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AppSettingsPageComponent } from './app-settings-page.component';

describe('AppSettingsPageComponent', () => {
  let component: AppSettingsPageComponent;
  let fixture: ComponentFixture<AppSettingsPageComponent>;

  beforeEach(waitForAsync(() => {
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
