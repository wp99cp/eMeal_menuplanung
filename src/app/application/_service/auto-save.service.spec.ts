import { TestBed } from '@angular/core/testing';

import { AutoSaveService } from './auto-save.service';

describe('AutoSaveService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AutoSaveService = TestBed.get(AutoSaveService);
    expect(service).toBeTruthy();
  });
});
