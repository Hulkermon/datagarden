export interface IMapClickEventWrapper {
  event: mapboxgl.MapMouseEvent & {
    features?: mapboxgl.MapboxGeoJSONFeature[];
  } & mapboxgl.EventData
}