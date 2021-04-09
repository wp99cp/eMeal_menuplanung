import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TemplateFooterComponent } from './template-footer.component';

describe('TemplateFooterComponent', () => {
  let component: TemplateFooterComponent;
  let fixture: ComponentFixture<TemplateFooterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TemplateFooterComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
