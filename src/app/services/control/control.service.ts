import { Injectable } from '@angular/core';
import { Map } from 'mapbox-gl';
import { Subject } from 'rxjs';
import { ILayer } from 'src/app/types/layer';
import { LayerService } from '../layer/layer.service';

@Injectable({
  providedIn: 'root'
})
export class ControlService {

  constructor(
    private layerService: LayerService,
  ) { }

  public addLayerControl(map: Map, $layerChange: Subject<ILayer>) {
    const layerIds = LayerService.allLayers.map(l => l.id);
    const notAllLayersDefined = layerIds.map(layerId => map.getLayer(layerId)).findIndex(layer => layer === undefined) !== -1;
    if (notAllLayersDefined) {
      console.error('💥Layer Control couldn\'t find all layers!💥');
      return;
    }


    layerIds.forEach(layerId => {
      const link = document.getElementById(layerId);
      if (link === null) {
        return;
      }

      const isVisible = map.getLayoutProperty(layerId, 'visibility') === 'visible';
      link.className = isVisible ? 'active' : 'inactive';

      link.onclick = e => {
        e.preventDefault();
        e.stopPropagation();

        const isActive = map.getLayoutProperty(layerId, 'visibility') === 'visible';
        if (!isActive) {
          layerIds.filter(id => id !== layerId).forEach(id => {
            map.setLayoutProperty(id, 'visibility', 'none');
            document.getElementById(id)!.className = '';
          });
          map.setLayoutProperty(layerId, 'visibility', 'visible');
          link.className = 'active';
          const previousActiveLayer = this.layerService.getActiveLayer();
          if (previousActiveLayer) { previousActiveLayer.active = false }
          const nextActiveLayer = this.layerService.getLayer(layerId);
          if (nextActiveLayer) {
            nextActiveLayer.active = true
            $layerChange.next(nextActiveLayer);
            if (nextActiveLayer.variations) {
              this.layerService.setLayerVariation(map, LayerService.currentLayerVariationIndex);
            }
          }
        }
      }

      document.getElementById('layer-control')!.style.display = 'inherit';
    });
  }
}
