import { Injectable } from '@angular/core';
import { Map } from 'mapbox-gl';

@Injectable({
  providedIn: 'root'
})
export class SourceService {
  static readonly plzSourceId = 'plz-source';
  static readonly enrollmentSourceId = 'plz-enrollment-source';
  static readonly familySourceId = 'family-source';

  static readonly sources = [{
  //   id: SourceService.plzSourceId,
  //   path: './assets/plz.min.geojson',
  // }, {
    id: SourceService.enrollmentSourceId,
    path: './assets/enrollment.min.geojson',
  }, {
    id: SourceService.familySourceId,
    path: './assets/family.min.geojson',
  }
  ];

  constructor() { }

  setupSources(map: Map) {
    SourceService.sources.forEach(source => {
      map.addSource(source.id, {
        type: 'geojson',
        data: source.path,
        generateId: true
      });
    });
  }
}
