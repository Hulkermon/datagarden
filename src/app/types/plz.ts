import { Feature } from 'geojson';

export interface IMunicipality {
  rec_art: string,
  onrp: number,
  bfsnr: number,
  plz_typ: number,
  postleitzahl: string,
  plz_zz: string,
  gplz: number,
  ortbez18: string,
  ortbez27: string,
  kanton: string,
  sprachcode: number,
  sprachcode_abw?: string,
  briefz_durch: number
  gilt_ab_dat: string,
  plz_briefzust: number,
  plz_coff: string,
  geo_shape?: Feature,
  geo_point_2d?: {
    lon: number,
    lat: number,
  }
}

export interface IPlzGeoJSON {
  type: string,
  features: [{
    type: string,
    geometry: {
      coordinates: [
        [[number, number]]
      ],
      type: string,
    },
    properties: {
      plz: number,
      ort: string,
      kanton: string,
      enrollmentScores?: any,
    },
  }],
};