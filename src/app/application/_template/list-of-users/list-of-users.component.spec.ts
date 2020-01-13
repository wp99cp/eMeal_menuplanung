import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfUsersComponent } from './list-of-users.component';

describe('ListOfUsersComponent', () => {
  let component: ListOfUsersComponent;
  let fixture: ComponentFixture<ListOfUsersComponent>;

  beforeEach(async(() => {
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
