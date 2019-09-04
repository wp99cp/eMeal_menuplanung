import { TestBed } from '@angular/core/testing';

import { ServiceDatabaseService } from './database.service';

describe('ServiceDatabaseService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ServiceDatabaseService = TestBed.get(ServiceDatabaseService);
    expect(service).toBeTruthy();
  });
});
