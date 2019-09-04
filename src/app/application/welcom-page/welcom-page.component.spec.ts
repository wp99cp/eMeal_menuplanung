import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomPageComponent } from './welcom-page.component';

describe('WelcomPageComponent', () => {
  let component: WelcomPageComponent;
  let fixture: ComponentFixture<WelcomPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WelcomPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
