import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampInfoComponent } from './camp-info.component';

describe('CampInfoComponent', () => {
  let component: CampInfoComponent;
  let fixture: ComponentFixture<CampInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CampInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
