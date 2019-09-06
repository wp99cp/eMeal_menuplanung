import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCampPageComponent } from './edit-camp-page.component';

describe('EditCampPageComponent', () => {
  let component: EditCampPageComponent;
  let fixture: ComponentFixture<EditCampPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCampPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCampPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
