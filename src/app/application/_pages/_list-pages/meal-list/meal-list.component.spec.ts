import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MealListComponent } from './meal-list.component';

describe('MealListComponent', () => {
  let component: MealListComponent;
  let fixture: ComponentFixture<MealListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MealListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MealListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
