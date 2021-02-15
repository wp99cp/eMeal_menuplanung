import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChangeLogComponent } from './change-log.component';

describe('ChangeLogComponent', () => {
  let component: ChangeLogComponent;
  let fixture: ComponentFixture<ChangeLogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
