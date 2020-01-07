import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MealsOverviewComponent } from './meals-overview.component';

describe('MealsOverviewComponent', () => {
  let component: MealsOverviewComponent;
  let fixture: ComponentFixture<MealsOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MealsOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MealsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
