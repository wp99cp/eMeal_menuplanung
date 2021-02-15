import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DatenschutzComponent } from './datenschutz.component';

describe('DatenschutzComponent', () => {
  let component: DatenschutzComponent;
  let fixture: ComponentFixture<DatenschutzComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DatenschutzComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatenschutzComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
