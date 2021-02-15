import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WelcomPageComponent } from './welcom-page.component';

describe('WelcomPageComponent', () => {
  let component: WelcomPageComponent;
  let fixture: ComponentFixture<WelcomPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [WelcomPageComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


});
