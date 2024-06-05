import { LngLatLike } from "mapbox-gl";

export interface ICameraPosition {
  center: LngLatLike,
  zoom: number,
  bearing: number,
  pitch: number,
  duration: number,
  layer: number, // layer number as displayed in layer control
  curve?: number,
  autoContinue?: boolean,
}