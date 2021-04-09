import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditSingleRecipeComponent } from './edit-single-recipe.component';

describe('EditSingleRecipeComponent', () => {
  let component: EditSingleRecipeComponent;
  let fixture: ComponentFixture<EditSingleRecipeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSingleRecipeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSingleRecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
