import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ImpressumComponent } from './impressum.component';

describe('ImpressumComponent', () => {
  let component: ImpressumComponent;
  let fixture: ComponentFixture<ImpressumComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ImpressumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImpressumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
