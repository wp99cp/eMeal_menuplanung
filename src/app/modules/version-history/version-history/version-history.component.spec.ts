import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionHistoryComponent } from './version-history.component';

describe('VersionHistoryComponent', () => {
  let component: VersionHistoryComponent;
  let fixture: ComponentFixture<VersionHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VersionHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
