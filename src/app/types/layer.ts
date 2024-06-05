export interface ILayer {
  id: string,
  name: string,
  sourceId: string,
  active: boolean,
  fillColor: any;
  style?: {
    fillExtrusionHeight?: any;
    coloringPropertyName: string,
    fromColor: string,
    toColor: string,
  },
  variations?: string[],
  min?: number,
  max?: number,
}