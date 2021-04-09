import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CopyRecipeComponent } from './copy-recipe.component';

describe('CopyRecipeComponent', () => {
  let component: CopyRecipeComponent;
  let fixture: ComponentFixture<CopyRecipeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CopyRecipeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyRecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
