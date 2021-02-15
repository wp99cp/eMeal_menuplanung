import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateMealComponent } from './create-meal.component';

describe('CreateMealComponent', () => {
  let component: CreateMealComponent;
  let fixture: ComponentFixture<CreateMealComponent>;

  beforeEach(waitForAsync(() => {
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
