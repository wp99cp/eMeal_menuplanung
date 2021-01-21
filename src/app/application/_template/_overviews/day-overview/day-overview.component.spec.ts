import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DayOverviewComponent } from './day-overview.component';

describe('MealsOverviewComponent', () => {
  let component: DayOverviewComponent;
  let fixture: ComponentFixture<DayOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DayOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
