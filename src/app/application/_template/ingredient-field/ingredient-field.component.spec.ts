import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientFieldComponent } from './ingredient-field.component';

describe('IngredientFieldComponent', () => {
  let component: IngredientFieldComponent;
  let fixture: ComponentFixture<IngredientFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IngredientFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IngredientFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
