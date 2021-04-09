import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DeepCopyMealComponent } from './deep-copy-meal.component';

describe('DeepCopyMealComponent', () => {
  let component: DeepCopyMealComponent;
  let fixture: ComponentFixture<DeepCopyMealComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DeepCopyMealComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeepCopyMealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
