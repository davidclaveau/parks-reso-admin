import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from '../services/config.service';
import { DataService } from '../services/data.service';
import { LoggerService } from '../services/logger.service';
import { PassService } from '../services/pass.service';
import { QrScannerService } from '../shared/components/qr-scanner/qr-scanner.service';
import { Constants } from '../shared/utils/constants';
import { MockData } from '../shared/utils/mock-data';
import { PassCheckInListComponent } from './pass-check-in-list/pass-check-in-list.component';

import { PassManagementComponent } from './pass-management.component';
import { QrResultComponent } from './qr-result/qr-result.component';

describe('PassManagementComponent', () => {
  let component: PassManagementComponent;
  let fixture: ComponentFixture<PassManagementComponent>;

  const mockUrl = `https://test.gov.bc.ca/testing?registrationNumber=${
    MockData.mockPass_1.registrationNumber
  }&park=${MockData.mockPass_1.pk.split('::')[1]}`;

  const mockPassService = {
    fetchData: (park, passId) => {
      return [{ ...MockData.mockPass_1 }];
    },
  };

  const mockDataService = {
    setItemValue: (id, value) => {},
    watchItem: (id) => {
      return new BehaviorSubject([
        { ...MockData.mockPass_1 },
        { ...MockData.mockPass_2 },
      ]);
    },
  };

  const mockQrScannerService = {
    disableScanner: () => {},
    clearScannerOutput: () => {},
    watchScannerState: () => {
      return new BehaviorSubject(true);
    },
    watchScannerOutput: () => {
      return new BehaviorSubject(null);
    },
  };

  @Component({
    selector: 'app-qr-scanner',
    template: '',
  })
  class MockProductEditorComponent {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PassManagementComponent,
        PassCheckInListComponent,
        MockProductEditorComponent,
        QrResultComponent,
      ],
      providers: [
        { provide: PassService, useValue: mockPassService },
        { provide: QrScannerService, useValue: mockQrScannerService },
        { provide: DataService, useValue: mockDataService },
        LoggerService,
        ConfigService,
      ],
      imports: [HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PassManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });

  it('should set check in list event', async () => {
    const setItemValueSpy = spyOn(mockDataService, 'setItemValue');
    const event = 'AWOOGA';
    component.passCheckInListEvent(event);
    expect(setItemValueSpy).toHaveBeenCalledOnceWith(
      Constants.dataIds.PASS_CHECK_IN_LIST_EVENT,
      event
    );
  });

  it('should set mode', async () => {
    component.setMode('manual');
    expect(component.mode).toEqual('manual');
    expect(component.passes).toEqual([]);
  });

  it('should get params from url', async () => {
    const getPassSpy = spyOn(component, 'getPass');
    await component.processUrl(mockUrl);

    expect(getPassSpy).toHaveBeenCalledWith(
      MockData.mockPass_1.pk.split('::')[1],
      MockData.mockPass_1.registrationNumber
    );
  });

  it('should get pass', async () => {
    const disableScannerSpy = spyOn(mockQrScannerService, 'disableScanner');
    await component.processUrl(mockUrl);

    expect(disableScannerSpy).toHaveBeenCalled();
  });

  it('should clear scanner output and set empty array on destroy', async () => {
    const clearScannerOutputSpy = spyOn(
      mockQrScannerService,
      'clearScannerOutput'
    );
    const setItemValueSpy = spyOn(mockDataService, 'setItemValue');

    component.ngOnDestroy();

    expect(clearScannerOutputSpy).toHaveBeenCalled();
    expect(setItemValueSpy).toHaveBeenCalledWith(
      Constants.dataIds.PASS_CHECK_IN_LIST,
      []
    );
  });
});