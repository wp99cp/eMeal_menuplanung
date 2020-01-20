import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportPdfWithLatexComponent } from './export-pdf-with-latex.component';

describe('ExportPdfWithLatexComponent', () => {
  let component: ExportPdfWithLatexComponent;
  let fixture: ComponentFixture<ExportPdfWithLatexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportPdfWithLatexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportPdfWithLatexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
