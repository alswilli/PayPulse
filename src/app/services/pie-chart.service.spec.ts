import { TestBed } from '@angular/core/testing';

import { PieChartService } from './pie-chart.service';

describe('PieChartService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PieChartService = TestBed.get(PieChartService);
    expect(service).toBeTruthy();
  });
});
