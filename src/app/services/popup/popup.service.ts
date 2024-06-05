import { Injectable } from '@angular/core';
import { Popup } from 'mapbox-gl';
import { IMapClickEventWrapper } from 'src/app/types/mapClickEvent';
import { LayerService } from '../layer/layer.service';

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  constructor(
    private layerService: LayerService,
  ) { }

  /**
   * generatePopup
   * @returns a mapbox popup
   */
  public generatePopup(event: IMapClickEventWrapper['event'], popupContainer: any): mapboxgl.Popup {

    const popupProperties = (event.features!)[0].properties;
    return new Popup({ maxWidth: 'none', anchor: 'bottom' })
      .setLngLat(event.lngLat)
      .setDOMContent(popupContainer.nativeElement);

    const activeLayer = this.layerService.getActiveLayer();
    switch (activeLayer.id) {
      case LayerService.enrollmentKiTotalLayerId:
      case LayerService.enrollmentPrTotalLayerId:
      case LayerService.enrollmentSeTotalLayerId:
        return this.generateEnrollmentPopup(event, 'total')
      case LayerService.enrollmentKiDiffLayerId:
      case LayerService.enrollmentPrDiffLayerId:
      case LayerService.enrollmentSeDiffLayerId:
        return this.generateEnrollmentPopup(event, 'diff');
      case LayerService.familyScoreTotalLayerId:
        return this.generateFamilyPopup(event, 'total');
      case LayerService.familyScorePerPersonLayerId:
        return this.generateFamilyPopup(event, 'person');
      case LayerService.familyScoreDiffLayerId:
        return this.generateFamilyPopup(event, 'diff');
      default:
        return this.generateDefaultPopup(event)
    }
  }

  private generateDefaultPopup(event: IMapClickEventWrapper['event']): Popup {
    let style = '<style>* {text-align: center}</style>';
    let text = '<h2>✨ Default Popup ✨</h2><h4>[coder] hasn\'t put anything here yet :(</h4>';
    return new Popup({ closeOnClick: true })
      .setHTML(style + text)
      .setLngLat(event.lngLat);
  }

  private generateEnrollmentPopup(event: IMapClickEventWrapper['event'], type: 'total' | 'diff'): Popup {
    if (event.features && event.features[0].properties) {
      const properties = event.features[0].properties;
      // const html = `
      // <h2>📈 Graph 📉</h2>
      // <div id="enrollment-graph"></div>
      // `;

      // return new Popup({ closeOnClick: true })
      //   .setHTML(html)
      //   .setLngLat(event.lngLat);
      if (event.features && event.features[0].properties) {
        const properties = event.features[0].properties;
        const enrollmentScores = JSON.parse(properties['enrollmentScores']);
        const html =
          `
          <h2>${properties['plz']} - ${properties['ort']}</h2>
          <h3>Enrollment ${type}</h3>
          ${this.generateEnrollmentTable(enrollmentScores, type)}
        `;
        return new Popup({ closeOnClick: true, maxWidth: undefined })
          .setHTML(html)
          .setLngLat(event['lngLat']);
      }
    }
    return new Popup({ closeOnClick: true })
      .setText('⚠ Error loading properties ⚠')
      .setLngLat(event.lngLat);
  }

  /**
   * generates a *shnasty* table ✨
   * @param enrollmentScores an object containing year objects which each contain 3 numbers in an array
   */
  public generateEnrollmentTable(enrollmentScores: any, type: 'total' | 'diff'): string {
    const style = `<style>
      * {
        text-align: center;
      }
      table, td, th {
        border-collapse: collapse;
        padding: 0 3px;
      }
      th, td {
        border-right: 0.55px solid #c0c0c0;
      }
      tr:nth-child(even) {
        background-color: #dcdcdc;
      }
    </style>`
    let tableHtml = `${style}<table>`;
    let rows = ['', '', '', ''];
    rows = rows.map(() => '<tr>');
    rows[0] += '<th></th>';
    rows[1] += '<th>Kindergarten</th>';
    rows[2] += '<th>Primar</th>';
    rows[3] += '<th>Sekundar</th>';
    for (let year in enrollmentScores) {
      if (enrollmentScores[year] && enrollmentScores[year][type]) {
        rows[0] += `<th>${year}</th>`;
        rows[1] += `<td>${enrollmentScores[year][type][0]}</td>`;
        rows[2] += `<td>${enrollmentScores[year][type][1]}</td>`;
        rows[3] += `<td>${enrollmentScores[year][type][2]}</td>`;
      }
    }
    rows = rows.map(r => r += '</tr>');
    tableHtml += rows.join('');
    tableHtml += '</table>';
    return tableHtml;
  }

  private generateFamilyPopup(event: IMapClickEventWrapper['event'], type: 'total' | 'person' | 'diff'): Popup {
    let coloringProperty = '';
    switch (type) {
      case 'total':
        coloringProperty = 'fam_score';
        break;
      case 'person':
        coloringProperty = 'fam_sc_per_pers_var_zwei';
        break;
      case 'diff':
        coloringProperty = 'dif_fam_sc_per_pers_var_drei';
        break;
      default:
        break;
    }
    if (event.features && event.features[0].properties) {
      const properties = event.features[0].properties;
      const familyScores = JSON.parse(properties['familyScore']);
      const html =
        `
        <h2>${event.lngLat.lng.toFixed(2)} - ${event.lngLat.lat.toFixed(2)}</h2>
        <h3>Family Scores</h3>
        ${this.generateFamilyTable(familyScores)}
      `;
      return new Popup({ closeOnClick: true, maxWidth: undefined })
        .setHTML(html)
        .setLngLat(event['lngLat']);
    } else {
      return new Popup({ closeOnClick: true })
        .setText('⚠ Error loading properties ⚠')
        .setLngLat(event.lngLat);
    }
  }

  public generateFamilyTable(familyScores: any[]): string {
    const coloringProperty = this.layerService.getActiveLayer().style?.coloringPropertyName!;
    const style = `<style>
      * {
        text-align: center;
      }
      table, td, th {
        border-collapse: collapse;
        padding: 0 3px;
      }
      th, td {
        border-right: 0.55px solid #c0c0c0;
      }
      tr:nth-child(even) {
        background-color: #dcdcdc;
      }
    </style>`
    let tableHtml = `${style}<table>`;
    let rows = ['', '', '', ''];
    rows = rows.map(() => '<tr>');
    rows[0] += '<th></th>';
    rows[1] += '<th>Scores</th>';
    for (let year in familyScores) {
      if (coloringProperty === 'dif_fam_sc_per_pers_var_drei' && familyScores[year]['diff'] !== undefined) {
        rows[0] += `<th>${year}</th>`;
        rows[1] += `<td>${Math.round(familyScores[year]['diff'][coloringProperty])}</td>`;
      } else if (familyScores[year][coloringProperty] !== undefined) {
        rows[0] += `<th>${year}</th>`;
        rows[1] += `<td>${Math.round(familyScores[year][coloringProperty])}</td>`;
      }
    }
    rows = rows.map(r => r += '</tr>');
    tableHtml += rows.join('');
    tableHtml += '</table>';
    return tableHtml;
  }
}
