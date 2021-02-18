import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CampInfoComponent } from './camp-info.component';

describe('CampInfoComponent', () => {
  let component: CampInfoComponent;
  let fixture: ComponentFixture<CampInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CampInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
