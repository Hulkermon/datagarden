import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';
import { Feature } from 'geojson';
import { IPlzGeoJSON } from '../../types/plz';
import { IEnrollmentData, IEnrollmentScoresMinMax } from 'src/app/types/enrollment';
import { SourceService } from '../source/source.service';
import { LayerService } from '../layer/layer.service';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  allData: any;
  enrollmentScoresMinMax?: IEnrollmentScoresMinMax;
  familyScoresMinMax?: { min: number, max: number };
  TotalFamilyScoresMinMax?: { min: number, max: number };
  DiffFamilyScoresMinMax?: { min: number, max: number };

  constructor(
    private http: HttpClient,
    private layerService: LayerService,
  ) {
    this.findAllMinMax();
  }

  private getGeoJsonFile(): Observable<IPlzGeoJSON> {
    const path = SourceService.sources.find(s => s.id == SourceService.plzSourceId)!.path;
    return this.http.get<IPlzGeoJSON>(path);
  }

  /**
   * getAllGeoJson
   * @returns an array of GeoJson features.  
   * `properties: {
   *    plz: number,
   *    ort: string,
   *    kanton: string,
   * }`
   */
  public getAllPlz(): Promise<Feature[]> {
    return new Promise(resolve => {
      this.getGeoJsonFile().subscribe(data => {
        resolve(data.features as Feature[]);
      });
    });
  }

  public getEnrollmentScores(): Promise<IEnrollmentData[]> {
    return new Promise(resolve => {
      let enrollmentScores: IEnrollmentData[] = [];
      const path = SourceService.sources.find(s => s.id == SourceService.enrollmentSourceId)!.path;
      this.http.get<any>(path).subscribe(allData => {
        allData.features.forEach((feature: any) => {
          enrollmentScores.push({
            ort: feature.properties.ort,
            enrollmentScores: feature.properties.enrollmentScores,
          });
        });
        resolve(enrollmentScores);
      });
    });
  }

  public getFamilyScores(): Promise<any[]> {
    return new Promise(resolve => {
      const path = SourceService.sources.find(s => s.id == SourceService.familySourceId)!.path;
      this.http.get<any>(path).subscribe(allData => {
        resolve(allData.features.map((f: any) => f.properties.familyScore));
      });
    });
  }

  private getEnrollmentScoresJSON(): Promise<IEnrollmentData[]> {
    return new Promise(resolve => {
      let enrollmentScores: IEnrollmentData[] = [];
      this.http.get<any>('./assets/enrollment2.json').subscribe(allData => {
        for (let ort in allData) {
          let data: IEnrollmentData = {
            ort,
            enrollmentScores: allData[ort],
          }
          enrollmentScores.push(data);
        }
        resolve(enrollmentScores);
      });
    });
  }

  public mapEnrollmentScoresToGeoJson(): Promise<IPlzGeoJSON> {
    return new Promise(resolve => {
      this.getEnrollmentScoresJSON().then(scoresByOrt => {
        this.getAllPlz().then(allPlz => {
          let arrayOfEditedOrts: any[] = [];
          scoresByOrt.forEach(scoreByOrt => {
            let ortsToEdit = allPlz.filter(plz => plz.properties?.['ort'] === scoreByOrt.ort);
            ortsToEdit.forEach(ortToEdit => {
              if (ortToEdit?.properties) {
                ortToEdit.properties = { ...ortToEdit.properties, enrollmentScores: scoreByOrt.enrollmentScores };
                arrayOfEditedOrts.push(ortToEdit);
              }
            });
          });
          const formattedGeoJson = {
            "type": "FeatureCollection",
            "features": arrayOfEditedOrts
          }
          resolve(formattedGeoJson as IPlzGeoJSON);
        });
      });
    });
  }

  /**
   * Calculates all min and max values for layers defined in layer-service
   */
  private findAllMinMax() {
    this.getEnrollmentScores().then(eScores => {
      this.enrollmentScoresMinMax = this.findMinMaxEnrollmentScores(eScores);

      const kiTotalLayer = this.layerService.getLayer(LayerService.enrollmentKiTotalLayerId)!;
      // kiTotalLayer.min = this.enrollmentScoresMinMax.kindergarten.total.min;
      kiTotalLayer.min = 0;
      kiTotalLayer.max = this.enrollmentScoresMinMax.kindergarten.total.max;

      // const kiDiffLayer = this.layerService.getLayer(LayerService.enrollmentKiDiffLayerId)!;
      // kiDiffLayer.min = this.enrollmentScoresMinMax.kindergarten.diff.min;
      // kiDiffLayer.max = this.enrollmentScoresMinMax.kindergarten.diff.max;

      const prTotalLayer = this.layerService.getLayer(LayerService.enrollmentPrTotalLayerId)!;
      // prTotalLayer.min = this.enrollmentScoresMinMax.primar.total.min;
      prTotalLayer.min = 0;
      prTotalLayer.max = this.enrollmentScoresMinMax.primar.total.max;

      // const prDiffLayer = this.layerService.getLayer(LayerService.enrollmentPrDiffLayerId)!;
      // prDiffLayer.min = this.enrollmentScoresMinMax.primar.diff.min;
      // prDiffLayer.max = this.enrollmentScoresMinMax.primar.diff.max;

      const seTotalLayer = this.layerService.getLayer(LayerService.enrollmentSeTotalLayerId)!;
      // seTotalLayer.min = this.enrollmentScoresMinMax.sekundar.total.min;
      seTotalLayer.min = 0;
      seTotalLayer.max = this.enrollmentScoresMinMax.sekundar.total.max;

      // const seDiffLayer = this.layerService.getLayer(LayerService.enrollmentSeDiffLayerId)!;
      // seDiffLayer.min = this.enrollmentScoresMinMax.sekundar.diff.min;
      // seDiffLayer.max = this.enrollmentScoresMinMax.sekundar.diff.max;
    });

    this.getFamilyScores().then(fScores => {
      this.familyScoresMinMax = this.findMinMaxFamilyScores(fScores);
      this.TotalFamilyScoresMinMax = this.findMinMaxTotalFamilyScores(fScores);
      this.DiffFamilyScoresMinMax = this.findMinMaxDiffFamilyScores(fScores);

      const familyTotalLayer = this.layerService.getLayer(LayerService.familyScoreTotalLayerId)!;
      familyTotalLayer.min = this.familyScoresMinMax.min;
      familyTotalLayer.max = this.familyScoresMinMax.max;

      const familyPerPersonLayer = this.layerService.getLayer(LayerService.familyScorePerPersonLayerId)!;
      familyPerPersonLayer.min = this.TotalFamilyScoresMinMax.min;
      // familyPerPersonLayer.max = this.TotalFamilyScoresMinMax.max;
      // setting this manually as requested by Lukas
      familyPerPersonLayer.max = 10000;

      const familyDiffLayer = this.layerService.getLayer(LayerService.familyScoreDiffLayerId)!;
      // familyDiffLayer.min = this.DiffFamilyScoresMinMax.min;
      // familyDiffLayer.max = this.DiffFamilyScoresMinMax.max;
      familyDiffLayer.min = -10;
      familyDiffLayer.max = 10;
    });
  }

  private findMinMaxEnrollmentScores(eScores: IEnrollmentData[]): IEnrollmentScoresMinMax {
    let allKiTotal: number[] = [];
    let allKiDiff: number[] = [];
    let allPrTotal: number[] = [];
    let allPrDiff: number[] = [];
    let allSeTotal: number[] = [];
    let allSeDiff: number[] = [];
    eScores.forEach(scores => {
      for (let year in scores.enrollmentScores) {
        allKiTotal.push(scores.enrollmentScores[year]['total']?.[0] | 0);
        allKiDiff.push(scores.enrollmentScores[year]['diff']?.[0] | 0);
        allPrTotal.push(scores.enrollmentScores[year]['total']?.[1] | 0);
        allPrDiff.push(scores.enrollmentScores[year]['diff']?.[1] | 0);
        allSeTotal.push(scores.enrollmentScores[year]['total']?.[2] | 0);
        allSeDiff.push(scores.enrollmentScores[year]['diff']?.[2] | 0);
      }
    })
    return {
      kindergarten: {
        total: {
          min: Math.min(...allKiTotal),
          max: Math.max(...allKiTotal),
        },
        diff: {
          min: Math.min(...allKiDiff),
          max: Math.max(...allKiDiff),
        }
      },
      primar: {
        total: {
          min: Math.min(...allPrTotal),
          max: Math.max(...allPrTotal),
        },
        diff: {
          min: Math.min(...allPrDiff),
          max: Math.max(...allPrDiff),
        }
      },
      sekundar: {
        total: {
          min: Math.min(...allSeTotal),
          max: Math.max(...allSeTotal),
        },
        diff: {
          min: Math.min(...allSeDiff),
          max: Math.max(...allSeDiff),
        }
      }
    }
  }

  private findMinMaxFamilyScores(fScores: any[]) {
    let min = fScores[0]['2012']['fam_score'];
    let max = fScores[0]['2012']['fam_score'];
    fScores.forEach(fScore => {
      for (let year in fScore) {
        if (fScore[year]['fam_score'] < min) {
          min = fScore[year]['fam_score'];
        } else if (fScore[year]['fam_score'] > max) {
          max = fScore[year]['fam_score'];
        }
      }
    });
    return { min: Math.round(min), max: Math.round(max) };
  }

  private findMinMaxTotalFamilyScores(fScores: any[]) {
    const variableName = this.layerService.getLayer(LayerService.familyScorePerPersonLayerId)?.style?.coloringPropertyName;
    let min = 999;
    let max = 0;
    fScores.forEach(fScore => {
      for (let year in fScore) {
        if (fScore[year]) {
          const currentScore = fScore[year][variableName!];
          if (currentScore < min) {
            min = currentScore;
          } else if (currentScore > max) {
            max = currentScore;
          }
        }
      }
    });
    return { min: Math.round(min), max: Math.round(max) };
  }

  private findMinMaxDiffFamilyScores(fScores: any[]) {
    const variableName = this.layerService.getLayer(LayerService.familyScoreDiffLayerId)?.style?.coloringPropertyName;
    let min = 999;
    let max = 0;
    const rawScores: number[] = [];
    fScores.forEach(fScore => {
      for (let year in fScore) {
        if (fScore[year]['diff']) {
          const currentScore = fScore[year]['diff'][variableName!];
          rawScores.push(currentScore);
          if (currentScore < min) {
            min = currentScore;
          } else if (currentScore > max) {
            max = currentScore;
          }
        }
      }
    });
    return { min: Math.round(min), max: Math.round(max) };
  }
}
