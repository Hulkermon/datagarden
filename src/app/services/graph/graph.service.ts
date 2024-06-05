import { Injectable } from '@angular/core';
import { ILayer } from 'src/app/types/layer';
import { IMapClickEventWrapper } from 'src/app/types/mapClickEvent';
import { LayerService } from '../layer/layer.service';

@Injectable({
  providedIn: 'root'
})
export class GraphService {

  constructor(
    private layerService: LayerService,
  ) { }

  public getGraph(event: IMapClickEventWrapper['event']) {
    const properties = (event.features!)[0].properties!;
    const activeLayer = this.layerService.getActiveLayer();
    const x_data = activeLayer.variations;
    const y_data = this.getYdata(activeLayer, properties);
    const graph = {
      data: [
        { x: x_data, y: y_data, type: 'scatter', mode: 'lines+points', marker: { color: 'red' } },
      ],
      layout: {
        height: 300,
        width: 300,
        title: this.getTitle(activeLayer, properties),
        margin: { t: 40, r: 25, b: 25, l: 40 },
        paper_bgcolor: '#1f1f1f',
        plot_bgcolor: '#1f1f1f',
        font: {
          color: '#d3d3d3',
        },
      }
    };

    return graph;
  }

  private getYdata(layer: ILayer, properties: any): number[] {
    const yData: any[] = [];
    let scores: any;
    switch (layer.id) {
      /** Enrollment Kindergarten (Total) */
      case LayerService.enrollmentKiTotalLayerId:
        scores = JSON.parse(properties['enrollmentScores']);
        layer.variations?.forEach(year => {
          yData.push(scores[year] ? scores[year]['total'][0] : undefined);
        });
        break;

      /** Enrollment Primar (Total) */
      case LayerService.enrollmentPrTotalLayerId:
        scores = JSON.parse(properties['enrollmentScores']);
        layer.variations?.forEach(year => {
          yData.push(scores[year] ? scores[year]['total'][1] : undefined);
        });
        break;

      /** Enrollment Sekundar (Total) */
      case LayerService.enrollmentSeTotalLayerId:
        scores = JSON.parse(properties['enrollmentScores']);
        layer.variations?.forEach(year => {
          yData.push(scores[year] ? scores[year]['total'][2] : undefined);
        });
        break;

      /** Family Score (Total) */
      case LayerService.familyScoreTotalLayerId:
        scores = JSON.parse(properties['familyScore']);
        layer.variations?.forEach(year => {
          yData.push(scores[year] ? scores[year][layer.style!.coloringPropertyName] : undefined);
        });
        break;

      /** Family Score / Person */
      case LayerService.familyScorePerPersonLayerId:
        scores = JSON.parse(properties['familyScore']);
        layer.variations?.forEach(year => {
          yData.push(scores[year] ? scores[year][layer.style!.coloringPropertyName] : undefined);
        });
        break;

      /** Family Score / Person (Diff) */
      case LayerService.familyScoreDiffLayerId:
        scores = JSON.parse(properties['familyScore']);
        layer.variations?.forEach(year => {
          yData.push((scores[year] && scores[year]['diff']) ? scores[year]['diff'][layer.style!.coloringPropertyName] : undefined);
        });
        break;

      default:
        break;
    }

    return yData;
  }

  private getTitle(layer: ILayer, properties: any): string {
    let title = '';
    switch (layer.id) {
      case LayerService.enrollmentKiTotalLayerId:
      case LayerService.enrollmentPrTotalLayerId:
      case LayerService.enrollmentSeTotalLayerId:
        title = `📈 ${properties['ort']}, ${properties['kanton']} 📉`;
        break;
      case LayerService.familyScoreTotalLayerId:
        title = `📈 Family Score (Total) 📉`;
        break;
      case LayerService.familyScorePerPersonLayerId:
        title = `📈 Family Score / Person 📉`;
        break;
      case LayerService.familyScoreDiffLayerId:
        title = `📈 Family Score / Person (Diff) 📉`;
        break;

      default:
        break;
    }

    return title;
  }
}
