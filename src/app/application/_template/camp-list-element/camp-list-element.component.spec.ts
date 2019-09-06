import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampListElementComponent } from './camp-list-element.component';

describe('CampListElementComponent', () => {
  let component: CampListElementComponent;
  let fixture: ComponentFixture<CampListElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CampListElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampListElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
