import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDayComponent } from './edit-day.component';

describe('EditDayComponent', () => {
  let component: EditDayComponent;
  let fixture: ComponentFixture<EditDayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
