import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateCampComponent } from './create-camp.component';

describe('CreateCampComponent', () => {
  let component: CreateCampComponent;
  let fixture: ComponentFixture<CreateCampComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateCampComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
