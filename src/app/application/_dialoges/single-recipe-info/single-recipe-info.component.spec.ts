import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleRecipeInfoComponent } from './single-recipe-info.component';

describe('SingleRecipeInfoComponent', () => {
  let component: SingleRecipeInfoComponent;
  let fixture: ComponentFixture<SingleRecipeInfoComponent>;

  beforeEach(async(() => {
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
