import {useState, useEffect} from 'react';
import { FlatList, View, Text} from "react-native";
import { WebView } from "react-native-webview";

/**
 * 
 * @param {String} PlaceName - Name of the place to search 
 * @returns {Object} - returns an Object containing StatusCode, responseData, and message
 */
export const SearchByPlace = async (PlaceName) => {
  let StatusCode = null;
  try {
    let limit = 5;
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=${limit}&q=${encodeURIComponent(PlaceName)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent':'expo-leaflet-navigation-map'
      }
    });

    const data = await response.json();
    StatusCode = response.status;

    return {
      StatusCode,
      responseData: data,
      message: StatusCode == 200 ? 'Success': 'Failed to fetch data'
    }

  }
  catch (e) {
    console.error(e);
    return {
      StatusCode: 500,
      responseData: null,
      message: 'An error occurred while fetching data'
    }
  }
};

export const LeafletMap = ({
  theme = 'dark',
  coordinates = [14.5995, 120.9842],
  zoom = 6,
  markers = [],
  onMarkerPress,
  ShowZoomControls = false,
  route = null,
  ShowDirectionPanel = false,
}) => {

  const [directions, setDirections] = useState([]);

  let url;
  let mapFilter;

  if (theme.toLowerCase() === 'dark') {
    url = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    mapFilter = `#map {
            filter: invert(1) hue-rotate(200deg) brightness(2.5) contrast(1.1);
          }`
  }
  else if (theme.toLowerCase() === 'light') {
    url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  }
  else {
    throw new Error('Invalid theme. Use "light" or "dark" only.');
  }

  

  const template = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css" />
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>
        <style>
          html, body, #map { 
            height: 100%; 
            margin: 0; 
            padding: 0; 
          }
          .leaflet-routing-container { 
            display: none !important; 
          }

          ${mapFilter || ''}
          
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>

          let focusTimer = null;
          let isUserInteracting = false;
          let autoFocusEnabled = ${route?.onFocus ? 'true' : 'false'};

          let map = L.map('map', {
            zoomControl: ${ShowZoomControls},
            attributionControl: false,
          }).setView([${coordinates[0]}, ${coordinates[1]}], ${zoom});

          L.tileLayer('${url}', {
            maxZoom: 19,
          }).addTo(map);

          // Add markers
          const markers = ${JSON.stringify(markers)};
          markers.forEach(m => {
            const marker = L.marker([m.lat, m.lng]).addTo(map);
            if (m.title) marker.bindPopup(m.title);
            marker.on("click", () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: "marker_click", id: m.id }));
            });
          });

          const route = ${JSON.stringify(route)};
          if (route && route.start && route.end) {
            const control = L.Routing.control({
              waypoints: [
                L.latLng(route.start[0], route.start[1]),
                L.latLng(route.end[0], route.end[1])
              ],
              lineOptions: {
                  styles: [
                      {color: route.routeColor || 'red', opacity: 0.15, weight: 9}, // Outer border
                      {color: route.routeColor || 'red', opacity: 0.8, weight: 6},  // Inner line
                      {color: route.routeColor || 'red', opacity: 1, weight: 2}      // Actual route color
                  ]
              },
              routeWhileDragging: false,
              addWaypoints: false,
              draggableWaypoints: false,
              show: false,
              createMarker: () => null
            }).addTo(map);

            // Listen for route found
            control.on("routesfound", function(e) {
              const instructions = [];
              e.routes[0].instructions.forEach(step => {
                instructions.push({
                  text: step.text,
                  distance: step.distance,
                  time: step.time
                });
              });
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: "directions", steps: instructions }));
            });
          }

          function focusMap(lat, lng, zoom) {
            if (map && !isUserInteracting && autoFocusEnabled) {
              map.setView([lat, lng], zoom || map.getZoom());
            }
          }

          map.on('movestart', () => {
            isUserInteracting = true;
            clearTimeout(focusTimer);
            // disable auto-focus for 30s after user moves
            focusTimer = setTimeout(() => {
              isUserInteracting = false;
            }, 5000);
          });

          if (autoFocusEnabled) {
            setInterval(() => {
              focusMap(route.start[0], route.start[1], ${zoom});
            }, 5000);
          }

          setTimeout(() => map.invalidateSize(), 500);
        </script>
      </body>
    </html>
  `;

  const Navigation_Direction_Panel = ({ item }) => {
    return (
      <View style={{ padding: 6 }}>
        <Text style={{ fontSize: 14, color: theme === "dark" ? "white":'gray'}}>{item.text}</Text>
        <Text style={{ fontSize: 12, color: "gray" }}>
          {Math.round(item.distance)}m · {Math.round(item.time / 60)} min
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, height: "100%" }}>
      <WebView
        key={JSON.stringify(markers)}
        originWhitelist={["*"]}
        source={{ html: template }}
        style={{ flex: 1 }}
        onMessage={(event) => {
          try {
            const msg = JSON.parse(event.nativeEvent.data);
            if (msg.type === "marker_click" && onMarkerPress) {
              onMarkerPress(msg.id);
            } else if (msg.type === "directions") {
              setDirections(msg.steps);
            }
          } catch (e) {
            console.warn("Invalid message from Leaflet:", event.nativeEvent.data);
          }
        }}
      />

      {ShowDirectionPanel && directions.length > 0 && (
        <View style={{position: "absolute",bottom: 0,width: "100%", paddingLeft: 10, paddingRight: 10}}>
          <View style={{width: "100%",backgroundColor: theme === "dark"? "#00000013":"white",padding: 10,borderTopStartRadius: 20,borderTopEndRadius: 20,minHeight: 100,borderColor: "gray",borderWidth: 1, maxHeight: 250, marginBottom: 35}}>
            <FlatList
              data={directions}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({item}) => <Navigation_Direction_Panel item={item}/>}
            />
          </View>
        </View>
      )}
    </View>
  );
};