import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CopyCampComponent } from './copy-camp.component';

describe('CopyCampComponent', () => {
  let component: CopyCampComponent;
  let fixture: ComponentFixture<CopyCampComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CopyCampComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyCampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
