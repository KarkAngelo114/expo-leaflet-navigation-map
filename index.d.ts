/**
 *  Allows you to integrate mapping component in your app.
 */

declare module 'expo-leaflet-navigation-map' {
  import * as React from 'react';

  export interface Marker {
    id: string | number;
    lat: number;
    lng: number;
    title?: string;
  }

  export interface Route {
    start: [number, number];
    end: [number, number];
  }

  export interface LeafletMapProps {
    coordinates?: [number, number];
    zoom?: number;
    markers?: Marker[];
    onMarkerPress?: (id: string | number) => void;
    ShowZoomControls?: boolean;
    route?: Route | null;
    ShowDirectionPanel?: boolean;
  }

  export const LeafletMap: React.FC<LeafletMapProps>;
}
