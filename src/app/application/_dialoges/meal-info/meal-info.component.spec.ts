import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MealInfoComponent } from './meal-info.component';

describe('MealInfoComponent', () => {
  let component: MealInfoComponent;
  let fixture: ComponentFixture<MealInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MealInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MealInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
