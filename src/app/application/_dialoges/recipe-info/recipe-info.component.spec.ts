import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeInfoComponent } from './recipe-info.component';

describe('RecipeInfoComponent', () => {
  let component: RecipeInfoComponent;
  let fixture: ComponentFixture<RecipeInfoComponent>;

  beforeEach(async(() => {
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
