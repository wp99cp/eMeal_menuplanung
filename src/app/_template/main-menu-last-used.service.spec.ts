import { TestBed } from '@angular/core/testing';

import { CurrentlyUsedMealService } from './currently-used-meal.service';

describe('MainMenuLastUsedService', () => {
  let service: CurrentlyUsedMealService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrentlyUsedMealService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
