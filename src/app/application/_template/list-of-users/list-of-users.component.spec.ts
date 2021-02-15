import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListOfUsersComponent } from './list-of-users.component';

describe('ListOfUsersComponent', () => {
  let component: ListOfUsersComponent;
  let fixture: ComponentFixture<ListOfUsersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ListOfUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListOfUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
