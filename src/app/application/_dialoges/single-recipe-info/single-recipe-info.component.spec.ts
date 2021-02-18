import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SingleRecipeInfoComponent } from './single-recipe-info.component';

describe('SingleRecipeInfoComponent', () => {
  let component: SingleRecipeInfoComponent;
  let fixture: ComponentFixture<SingleRecipeInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleRecipeInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleRecipeInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
