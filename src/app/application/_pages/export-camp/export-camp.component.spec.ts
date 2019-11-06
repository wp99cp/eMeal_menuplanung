import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportCampComponent } from './export-camp.component';

describe('ExportCampComponent', () => {
  let component: ExportCampComponent;
  let fixture: ComponentFixture<ExportCampComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportCampComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportCampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
