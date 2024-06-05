import { Injectable } from '@angular/core';
import { Map } from 'mapbox-gl';
import { ILayer } from 'src/app/types/layer';
import { StatYears, FutureYears } from 'src/app/types/statYears';
import { SourceService } from '../source/source.service';

@Injectable({
  providedIn: 'root'
})
export class LayerService {
  static currentLayerVariationIndex = 0;
  static readonly enrollmentKiTotalLayerId = 'enrollment-ki-total-layer';
  static readonly enrollmentPrTotalLayerId = 'enrollment-pr-total-layer';
  static readonly enrollmentSeTotalLayerId = 'enrollment-se-total-layer';
  static readonly enrollmentKiDiffLayerId = 'enrollment-ki-diff-layer';
  static readonly enrollmentPrDiffLayerId = 'enrollment-pr-diff-layer';
  static readonly enrollmentSeDiffLayerId = 'enrollment-se-diff-layer';
  static readonly familyScoreTotalLayerId = 'family-layer';
  static readonly familyScorePerPersonLayerId = 'family-tot-three-layer';
  static readonly familyScoreDiffLayerId = 'family-diff-three-layer';

  static readonly allLayers: ILayer[] = [
    /**
     * Enrollment Layers (Total)
     */
    {
      id: LayerService.enrollmentKiTotalLayerId,
      name: 'Enrollment Kindergarten (Total)',
      sourceId: SourceService.enrollmentSourceId,
      active: true,
      fillColor: '#ffffff',
      variations: StatYears.concat(FutureYears),
      style: {
        coloringPropertyName: 'enrollmentScores',
        fromColor: '#ffff00',
        toColor: '#0000ff'
      }
    },
    {
      id: LayerService.enrollmentPrTotalLayerId,
      name: 'Enrollment Primar (Total)',
      sourceId: SourceService.enrollmentSourceId,
      active: false,
      fillColor: '#ffffff',
      variations: StatYears.concat(FutureYears),
      style: {
        coloringPropertyName: 'enrollmentScores',
        fromColor: '#ffff00',
        toColor: '#0000ff',
      }
    },
    {
      id: LayerService.enrollmentSeTotalLayerId,
      name: 'Enrollment Sekundar (Total)',
      sourceId: SourceService.enrollmentSourceId,
      active: false,
      fillColor: '#ffffff',
      variations: StatYears.concat(FutureYears),
      style: {
        coloringPropertyName: 'enrollmentScores',
        fromColor: '#ffff00',
        toColor: '#0000ff',
      }
    },





    /**
     * Enrollment Layers (Diff)
     */
    // {
    //   id: LayerService.enrollmentKiDiffLayerId,
    //   name: 'Enrollment Kindergarten (Diff)',
    //   sourceId: SourceService.enrollmentSourceId,
    //   active: false,
    //   fillColor: '#ffffff',
    //   variations: StatYears.concat(FutureYears).slice(1),
    //   style: {
    //     coloringPropertyName: 'enrollmentScores',
    //     fromColor: '#ffff00',
    //     toColor: '#0000ff'
    //   }
    // },
    // {
    //   id: LayerService.enrollmentPrDiffLayerId,
    //   name: 'Enrollment Primar (Diff)',
    //   sourceId: SourceService.enrollmentSourceId,
    //   active: false,
    //   fillColor: '#ffffff',
    //   variations: StatYears.concat(FutureYears).slice(1),
    //   style: {
    //     coloringPropertyName: 'enrollmentScores',
    //     fromColor: '#ffff00',
    //     toColor: '#0000ff',
    //   }
    // },
    // {
    //   id: LayerService.enrollmentSeDiffLayerId,
    //   name: 'Enrollment Sekundar (Diff)',
    //   sourceId: SourceService.enrollmentSourceId,
    //   active: false,
    //   fillColor: '#ffffff',
    //   variations: StatYears.concat(FutureYears).slice(1),
    //   style: {
    //     coloringPropertyName: 'enrollmentScores',
    //     fromColor: '#ffff00',
    //     toColor: '#0000ff',
    //   }
    // },




    /**
     * Family Layer
     */
    {
      id: LayerService.familyScoreTotalLayerId,
      name: 'Family Score (Total)',
      sourceId: SourceService.familySourceId,
      active: false,
      fillColor: '#ffffff',
      variations: StatYears.concat(FutureYears),
      style: {
        coloringPropertyName: 'fam_score',
        fromColor: '#ff00ff',
        toColor: '#00ff00'
      }
    },

    /**
     * Family Diff Layers
     */
    {
      id: LayerService.familyScorePerPersonLayerId,
      name: 'Family Score / Person',
      sourceId: SourceService.familySourceId,
      active: false,
      fillColor: '#ffffff',
      variations: StatYears.concat(FutureYears),
      style: {
        coloringPropertyName: 'fam_sc_per_pers_var_zwei',
        fromColor: '#ff00ff',
        toColor: '#00ff00'
      }
    },
    {
      id: LayerService.familyScoreDiffLayerId,
      name: 'Family Score / Person (Diff)',
      sourceId: SourceService.familySourceId,
      active: false,
      fillColor: '#ffffff',
      variations: StatYears.concat(FutureYears).slice(1),
      style: {
        coloringPropertyName: 'dif_fam_sc_per_pers_var_drei',
        fromColor: '#ff0000',
        toColor: '#00ff00'
      }
    }
  ];

  constructor() { }

  public getActiveLayer(): ILayer {
    const activeLayer = LayerService.allLayers.find(l => l.active);
    if (activeLayer) { return activeLayer }
    throw new Error('No active Layer found');
  }

  public getLayer(id: string) {
    return LayerService.allLayers.find(l => l.id === id);
  }

  public addLayer(map: Map, layer: ILayer) {
    map.addLayer({
      id: layer.id,
      type: 'fill-extrusion',
      source: layer.sourceId,
      layout: {
        visibility: layer.active ? 'visible' : 'none',
      },
      paint: {
        'fill-extrusion-color': layer.fillColor ? layer.fillColor : '',
        'fill-extrusion-height': layer.style?.fillExtrusionHeight ? layer.style?.fillExtrusionHeight : 0,
        'fill-extrusion-opacity': ['interpolate',
          ['linear'],
          ['zoom'],
          8, 0.5,
          15, 0.25,
        ],
      }
    });
  }

  /**
   * setLayerVariation
   * If current layer has variations, switches variations based on index
   */
  public setLayerVariation(map: Map, index: number) {
    LayerService.currentLayerVariationIndex = index;
    const activeLayer = this.getActiveLayer();
    if (!activeLayer.variations) {
      return;
    }

    let minValue = activeLayer.min ? activeLayer.min : 0;
    let maxValue = activeLayer.max ? activeLayer.max : 100;
    let definingValue: any[] = [];
    switch (activeLayer.id) {
      case LayerService.enrollmentKiTotalLayerId:
        definingValue = ['at', 0, ['get', 'total', ['get', activeLayer.variations[index], ['get', 'enrollmentScores']]]];
        break;
      case LayerService.enrollmentPrTotalLayerId:
        definingValue = ['at', 1, ['get', 'total', ['get', activeLayer.variations[index], ['get', 'enrollmentScores']]]];
        break;
      case LayerService.enrollmentSeTotalLayerId:
        definingValue = ['at', 2, ['get', 'total', ['get', activeLayer.variations[index], ['get', 'enrollmentScores']]]];
        break;
      case LayerService.enrollmentKiDiffLayerId:
        definingValue = ['at', 0, ['get', 'diff', ['get', activeLayer.variations[index], ['get', 'enrollmentScores']]]];
        break;
      case LayerService.enrollmentPrDiffLayerId:
        definingValue = ['at', 1, ['get', 'diff', ['get', activeLayer.variations[index], ['get', 'enrollmentScores']]]];
        break;
      case LayerService.enrollmentSeDiffLayerId:
        definingValue = ['at', 2, ['get', 'diff', ['get', activeLayer.variations[index], ['get', 'enrollmentScores']]]];
        break;
      case LayerService.familyScoreTotalLayerId:
        definingValue = ['get', activeLayer.style?.coloringPropertyName, ['get', activeLayer.variations[index], ['get', 'familyScore']]];
        break;
      case LayerService.familyScorePerPersonLayerId:
        definingValue = ['round', ['get', activeLayer.style?.coloringPropertyName, ['get', activeLayer.variations[index], ['get', 'familyScore']]]];
        break;
      case LayerService.familyScoreDiffLayerId:
        definingValue = ['round', ['get', activeLayer.style?.coloringPropertyName, ['get', 'diff', ['get', activeLayer.variations[index], ['get', 'familyScore']]]]];
        break;
      default:
        break;
    }

    let newFillColor: any[] = [];
    if (activeLayer.id === LayerService.familyScoreDiffLayerId) {
      newFillColor = ['interpolate-hcl',
        ['linear'],
        definingValue,
        minValue, ['to-color', activeLayer.style?.fromColor],
        maxValue, ['to-color', activeLayer.style?.toColor],
      ]
    } else {
      newFillColor = ['interpolate-hcl',
        ['cubic-bezier', 0, 0.5, 0.75, 1],
        definingValue,
        minValue, ['to-color', activeLayer.style?.fromColor],
        maxValue, ['to-color', activeLayer.style?.toColor],
      ]
    }

    let newExtrusionHeight: any[] = [];
    if (activeLayer.id === LayerService.familyScoreDiffLayerId) {
      newExtrusionHeight = ['interpolate',
        ['linear'],
        ['abs', definingValue],
        0, 100,
        100, 5000
      ]
    }
    else {
      newExtrusionHeight = ['interpolate',
        ['cubic-bezier', 0, 0.25, 0.25, 1],
        definingValue,
        minValue, 100,
        maxValue, 5000
      ]
    }

    map.setPaintProperty(activeLayer.id, 'fill-extrusion-color', newFillColor);
    map.setPaintProperty(activeLayer.id, 'fill-extrusion-height', newExtrusionHeight);
  }
}
