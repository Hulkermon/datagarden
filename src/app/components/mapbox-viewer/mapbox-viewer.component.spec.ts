import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapboxViewerComponent } from './mapbox-viewer.component';

describe('MapboxViewerComponent', () => {
  let component: MapboxViewerComponent;
  let fixture: ComponentFixture<MapboxViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapboxViewerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapboxViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
