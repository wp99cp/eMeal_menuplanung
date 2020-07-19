import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSingleMealComponent } from './edit-single-meal.component';

describe('EditSingleMealComponent', () => {
  let component: EditSingleMealComponent;
  let fixture: ComponentFixture<EditSingleMealComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSingleMealComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSingleMealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
