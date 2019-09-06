import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MealListPageComponent } from './meal-list-page.component';

describe('RecipeListPageComponent', () => {
  let component: MealListPageComponent;
  let fixture: ComponentFixture<MealListPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MealListPageComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MealListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
