import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteCampComponent } from './delete-camp.component';

describe('DeleteCampComponent', () => {
  let component: DeleteCampComponent;
  let fixture: ComponentFixture<DeleteCampComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteCampComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteCampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
