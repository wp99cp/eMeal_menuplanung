import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MealPrepareComponent } from './meal-prepare.component';

describe('MealPrepareComponent', () => {
  let component: MealPrepareComponent;
  let fixture: ComponentFixture<MealPrepareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MealPrepareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MealPrepareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
