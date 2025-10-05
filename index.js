import {useState} from 'react';
import { FlatList, View, Text} from "react-native";
import { WebView } from "react-native-webview";

export const LeafletMap = ({
  coordinates = [14.5995, 120.9842],
  zoom = 13,
  markers = [],
  onMarkerPress,
  ShowZoomControls = true,
  route = null,
  ShowDirectionPanel = false
}) => {
  const [directions, setDirections] = useState([]);

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
          html, body, #map { height: 100%; margin: 0; padding: 0; }
          /* Hide the built-in routing panel & toggle completely */
          .leaflet-routing-container { display: none !important; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', {
            zoomControl: ${ShowZoomControls},
            attributionControl: false,
          }).setView([${coordinates[0]}, ${coordinates[1]}], ${zoom});

          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
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

          // Add route
          const route = ${JSON.stringify(route)};
          if (route && route.start && route.end) {
            const control = L.Routing.control({
              waypoints: [
                L.latLng(route.start[0], route.start[1]),
                L.latLng(route.end[0], route.end[1])
              ],
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

          setTimeout(() => map.invalidateSize(), 500);
        </script>
      </body>
    </html>
  `;

  const Navigation_Direction_Panel = ({ item }) => {
    return (
      <View style={{ padding: 6 }}>
        <Text style={{ fontSize: 14 }}>{item.text}</Text>
        <Text style={{ fontSize: 12, color: "gray" }}>
          {Math.round(item.distance)}m · {Math.round(item.time / 60)} min
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, height: "100%" }}>
      <WebView
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
        <View style={{position: "absolute",bottom: 0,width: "100%",padding: 12,paddingBottom: 30}}>
          <View style={{width: "100%",backgroundColor: "white",padding: 10,borderTopStartRadius: 20,borderTopEndRadius: 20,minHeight: 200,borderColor: "gray",borderWidth: 1,maxHeight: 300,}}>
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