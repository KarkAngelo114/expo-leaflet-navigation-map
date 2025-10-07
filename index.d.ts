/**
 *  expo-lealfet-navigation-map by Kark Angelo V. Pada
 *
 * This component allows you to integrate a leaflet map into your Expo React Native application through a webview.
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
    routeColor: string;
    onFocus: boolean;
  }

  export interface LeafletMapProps {
    coordinates?: [number, number];
    zoom?: number;
    markers?: Marker[];
    onMarkerPress?: (id: string | number) => void;
    ShowZoomControls?: boolean;
    route?: Route | null;
    ShowDirectionPanel?: boolean;
    theme?: 'light' | 'dark';
  }

  export const LeafletMap: React.FC<LeafletMapProps>;

  /**
  * 
  * @param {String} PlaceName - Name of the place to search 
  * @returns {Object} - returns an Object containing StatusCode, responseData, and message
  */
  export function SearchByPlace(PlaceName: String): Object;
}
