import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecipeInfoComponent } from './recipe-info.component';

describe('RecipeInfoComponent', () => {
  let component: RecipeInfoComponent;
  let fixture: ComponentFixture<RecipeInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecipeInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
