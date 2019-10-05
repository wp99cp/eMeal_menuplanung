import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DayElementComponent } from './day-element.component';

describe('DayElementComponent', () => {
  let component: DayElementComponent;
  let fixture: ComponentFixture<DayElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DayElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
