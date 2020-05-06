import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyCampComponent } from './copy-camp.component';

describe('CopyCampComponent', () => {
  let component: CopyCampComponent;
  let fixture: ComponentFixture<CopyCampComponent>;

  beforeEach(async(() => {
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
