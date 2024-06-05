import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { Subject } from 'rxjs';
import { ControlService } from 'src/app/services/control/control.service';
import { GraphService } from 'src/app/services/graph/graph.service';
import { LayerService } from 'src/app/services/layer/layer.service';
import { PopupService } from 'src/app/services/popup/popup.service';
import { SourceService } from 'src/app/services/source/source.service';
import { ICameraPosition } from 'src/app/types/cameraPosition';
import { ILayer } from 'src/app/types/layer';


@Component({
  selector: 'mapbox-viewer',
  templateUrl: './mapbox-viewer.component.html',
  styleUrls: ['./mapbox-viewer.component.scss']
})
export class MapboxViewerComponent implements OnInit {
  map!: mapboxgl.Map;
  hoveredFeatureId: number | undefined;
  firstIdle = true;
  allLayers = LayerService.allLayers;
  currentActiveLayer: ILayer;
  currentLayerVariationIndex = 0;
  $layerChange = new Subject<ILayer>();
  countryBounds: mapboxgl.LngLatBoundsLike = [[5.95590, 45.81796], [10.49219, 47.80845]];

  @ViewChild('layerControl') layerControl!: ElementRef<HTMLElement>;

  @ViewChild('popupContainer') popupContainer: any;
  graph: any;

  isPresenting = false;
  presentationButtonText = '✨ Start Presentation 🎥';

  constructor(
    private popupService: PopupService,
    public layerService: LayerService,
    private sourceService: SourceService,
    private controlService: ControlService,
    private graphService: GraphService,
  ) {
    (mapboxgl as any).accessToken = 'pk.eyJ1IjoiaHVsa2VybWFuIiwiYSI6ImNrN3VueDgxMjAwZXczZXBoODN2a2M5azQifQ.fodm0KDOS8nnBVODZeujeg';
    this.currentActiveLayer = this.layerService.getActiveLayer();
    this.$layerChange.subscribe(layer => {
      this.currentActiveLayer = layer;
    });
  }

  ngOnInit(): void {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/hulkerman/claqxp6a9000115p8890l69gk',
      zoom: 7,
      attributionControl: false,
      bounds: this.countryBounds,
      maxBounds: this.countryBounds,
      minZoom: 5,
      keyboard: false,
    });

    this.map.on('load', () => {
      this.map.addControl(new mapboxgl.NavigationControl());

      this.handleMouseEnter();
      this.handleMouseMove();
      this.handleMouseLeave();
      this.handleClick();

      this.sourceService.setupSources(this.map);

      LayerService.allLayers.forEach(layer => {
        this.layerService.addLayer(this.map, layer);
      });
      this.layerService.setLayerVariation(this.map, 0);
    });

    this.map.on('idle', () => {
      if (this.firstIdle) {
        this.playIntroAnimation();

        this.controlService.addLayerControl(this.map, this.$layerChange);

        this.firstIdle = false;
      }
    });
  }

  private playIntroAnimation() {
    this.map.flyTo({
      center: [8, 47],
      pitch: 60,
      zoom: 11,
      bearing: 10,
      duration: 1000,
    });
    setTimeout(() => {
      this.map.flyTo({
        center: [8.3, 47.1],
        bearing: -45,
        duration: 3000,
        curve: 0,
        easing: (t => t)
      });
      setTimeout(() => {
        this.map.flyTo({
          center: [8.15, 47],
          pitch: 0,
          zoom: 10,
          bearing: 0,
          duration: 1000,
        });
      }, 3000);
    }, 1000);
  }

  public handleSliderChange(index: number) {
    this.layerService.setLayerVariation(this.map, index);
    this.currentLayerVariationIndex = index;
  }

  private handleMouseEnter() {
    this.map.on('mouseenter', LayerService.allLayers.map(l => l.id), () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });
  }

  private handleMouseMove() {
    this.map.on('mousemove', LayerService.allLayers.map(l => l.id), e => {
      if (e.features?.length) {
        const activeLayerSourceId = this.layerService.getActiveLayer().sourceId;
        if (activeLayerSourceId) {
          if (this.hoveredFeatureId !== e.features[0].id) {
            if (this.hoveredFeatureId !== undefined) {
              this.map.setFeatureState(
                { source: activeLayerSourceId, id: this.hoveredFeatureId },
                { hover: false }
              );
            }
            this.hoveredFeatureId = (e.features[0].id as number);
            this.map.setFeatureState(
              { source: activeLayerSourceId, id: this.hoveredFeatureId },
              { hover: true }
            );
          }
        } else { console.error('💥No active layer sourceId found!💥') };
      }
    });
  }

  private handleMouseLeave() {
    this.map.on('mouseleave', LayerService.allLayers.map(l => l.id), () => {
      this.map.getCanvas().style.cursor = '';
      const activeLayerSourceId = this.layerService.getActiveLayer().sourceId;
      if (activeLayerSourceId) {
        this.map.setFeatureState(
          { source: activeLayerSourceId, id: this.hoveredFeatureId },
          { hover: false }
        );
        this.hoveredFeatureId = undefined;
      } else { console.error('💥No active layer sourceId found!💥') };
    });
  }

  private handleClick() {
    this.map.on('click', LayerService.allLayers.map(l => l.id), event => {
      this.graph = this.graphService.getGraph(event);
      this.popupService.generatePopup(event, this.popupContainer).addTo(this.map);
    });
  }









  /**
   * Presentation stuff!
   */

  camPosIndex = -1;
  isFlying = false;
  cameraPositions: ICameraPosition[] = [
    {
      bearing: 49.86132325141807,
      center: {
        lng: 11.986211049481994,
        lat: 49.40792083717375
      },
      pitch: 84.99999999999997,
      zoom: 6.059885316477091,
      duration: 1000,
      layer: 3,
    },
    {
      bearing: 16.118606008728307,
      center: {
        lng: 8.045401568376974,
        lat: 46.609500903107005
      },
      pitch: 37.52606089058971,
      zoom: 8.138445027955333,
      duration: 10000,
      autoContinue: true,
      layer: 3,
    }, {
      bearing: 59.31860600872801,
      center: {
        lng: 8.477101823326393,
        lat: 47.207034893934946
      },
      pitch: 80.99999999999996,
      zoom: 11.114014201776023,
      duration: 10000,
      autoContinue: true,
      layer: 3,
    }, {
      bearing: 59.31860600872801,
      center: {
        lng: 10.078817240442277,
        lat: 47.792338269521736
      },
      pitch: 80.99999999999997,
      zoom: 11.114014201776023,
      duration: 10000,
      curve: 0.5,
      autoContinue: true,
      layer: 3,
    }, {
      bearing: -91.4782044770298,
      center: {
        lng: 8.837826270149321,
        lat: 47.08476937127753
      },
      pitch: 55.77348339944852,
      zoom: 9.185460390559069,
      duration: 10000,
      layer: 0,
    }, {
      bearing: -172.88913546664054,
      center: {
        lng: 8.546631615250021,
        lat: 47.38301379985259
      },
      pitch: 68.22534232702397,
      zoom: 11.421526819886418,
      duration: 10000,
      layer: 0,
    }, {
      bearing: 143.3013503983742,
      center: {
        lng: 8.533455479370446,
        lat: 47.40822775590752
      },
      pitch: 64.21046161083773,
      zoom: 11.421526819886418,
      duration: 30000,
      layer: 0,
    }, {
      bearing: 75.77747497070186,
      center: {
        lng: 8.548624347593886,
        lat: 47.391350787838206
      },
      pitch: 57.71046161083775,
      zoom: 10.833436263461286,
      duration: 15000,
      layer: 3,
    }, {
      bearing: 75.77747497070186,
      center: {
        lng: 8.607517381752132,
        lat: 47.43216409069868
      },
      pitch: 57.71046161083775,
      zoom: 10.833436263461286,
      duration: 10000,
      layer: 4,
      autoContinue: true
    }, {
      bearing: 21.543185109680508,
      center: {
        lng: 8.285491633388688,
        lat: 47.0852342878766
      },
      pitch: 49.67684620692707,
      zoom: 11.741909391870209,
      duration: 30000,
      layer: 4,
      curve: 2.5,
    }, {
      bearing: 46.63759381798218,
      center: {
        lng: 8.27951923910939,
        lat: 47.0668537796152
      },
      pitch: 19.485164783362766,
      zoom: 13.087060888636122,
      duration: 10000,
      layer: 3,
    }, {
      bearing: 74.6375938179815,
      center: {
        lng: 8.27951923910939,
        lat: 47.06685377961526
      },
      pitch: 22.48516478336277,
      zoom: 13.087060888636122,
      duration: 30000,
      layer: 4
    }
  ]

  public togglePresentation() {
    this.isPresenting = !this.isPresenting;
    if (this.isPresenting) {
      this.presentationButtonText = '🛑 Stop Presentation 🎥';
      // this.camPosIndex = 7;
      this.camPosIndex = -1;
      this.map.setMaxBounds(undefined);
      this.nextCameraPosition();
    } else {
      this.presentationButtonText = '✨ Start Presentation 🎥';
      this.map.setMaxBounds(this.countryBounds);
      this.map.setPitch(0);
      this.map.setBearing(0);
      this.map.setZoom(7);
      this.map.fitBounds(this.countryBounds);
    }
  }

  @HostListener('window:keydown.ArrowRight', ['$event'])
  nextCameraPosition() {
    if (!this.isPresenting) return;

    if (this.isFlying) {
      this.map.flyTo({ ...this.cameraPositions[this.camPosIndex], duration: 1000 })
      this.isFlying = false;
      return;
    }
    if (this.camPosIndex >= this.cameraPositions.length - 1) return;

    const camPos = this.cameraPositions[++this.camPosIndex];

    if (camPos.layer !== undefined) {
      const linkElement = this.layerControl.nativeElement.children.item(camPos.layer);
      linkElement?.dispatchEvent(new Event('click'));
    }

    this.map.flyTo({
      ...camPos
    });
    this.isFlying = true;
    setTimeout(() => {
      if (camPos.autoContinue) {
        this.isFlying = false;
        this.nextCameraPosition();
      } else {
        setTimeout(() => {
          this.isFlying = false;
        }, camPos.duration / 3);
      }
    }, camPos.duration - camPos.duration / 3);
  }

  @HostListener('window:keydown.ArrowLeft', ['$event'])
  previousCameraPosition() {
    if (!this.isPresenting) return;
    if (this.camPosIndex <= 0) return;

    const camPos = this.cameraPositions[--this.camPosIndex];

    if (camPos.layer !== undefined) {
      const linkElement = this.layerControl.nativeElement.children.item(camPos.layer);
      linkElement?.dispatchEvent(new Event('click'));
    }

    this.map.flyTo({
      ...camPos,
      duration: 1000,
    });
  }

  @HostListener('window:keydown.ArrowDown', ['$event'])
  logCameraPosition() {
    const camPos: ICameraPosition = {
      bearing: this.map.getBearing(),
      center: this.map.getCenter(),
      pitch: this.map.getPitch(),
      zoom: this.map.getZoom(),
      duration: 0,
      layer: -1,
    };
    console.log('CameraPosition:', camPos);
  }
}
