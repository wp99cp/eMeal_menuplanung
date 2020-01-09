import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMealComponent } from './create-meal.component';

describe('CreateMealComponent', () => {
  let component: CreateMealComponent;
  let fixture: ComponentFixture<CreateMealComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateMealComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
