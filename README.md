# expo-leaflet-navigation-map

A lightweight React Native component for Expo projects that integrates [LeafletJS](https://leafletjs.com/), [OpenStreetMap](https://www.openstreetmap.org/), and [Leaflet Routing Machine](https://www.liedman.net/leaflet-routing-machine/) through a WebView.

✅ Display maps with OpenStreetMap tiles  
✅ Add markers  
✅ Draw routes between two points using free OSM data  
✅ Show a built-in directions panel (optional)

## Getting started

Install via npx expo installation

```bash
npx expo install expo-leaflet-navigation-map
```

## Usage

Import `expo-leaflet-navigation-map`:

```Javascript
import { LeafletMap } from 'expo-leaflet-navigation-map';
```

Then you can use it as is:

```Javascript
import {View} from 'react-native';
import { LeafletMap } from 'expo-leaflet-navigation-map';

const App = () => {
    return (
        <View style={{flex:1}}>
            <LeafletMap/>
        </View>
    );
}

export default App;
```

By default, it points to Manila, the capital city of the Philippines, and has no marker. You can pass `coordinates` and `markers` props to the component:

```Javascript
import {View} from 'react-native';
import { LeafletMap } from 'expo-leaflet-navigation-map';

const App = () => {
    const lat = /* latitude value here*/;
    const long = /*longitude value here*/
    return (
        <View style={{flex:1}}>
            <LeafletMap coordinates = {[lat, long]} markers = {[{ id:1, lat: lat, long: long, title: "My Location"}]}/>
        </View>
    );
}
export default App;
```

You can also adjust the zoom by passing a `zoom` value:

```Javascript
import {View} from 'react-native';
import { LeafletMap } from 'expo-leaflet-navigation-map';

const App = () => {
    const lat = /* latitude value here*/;
    const long = /*longitude value here*/
    return (
        <View style={{flex:1}}>
            <LeafletMap coordinates = {[lat, long]} markers = {[{ id:1, lat: lat, long: long, title: "My Location"}]} zoom={13}/>
        </View>
    );
    
}

export default App;
```

If you're working with navigations and want to display it on the map, you can pass `route` prop and toggling `ShowDirectionPanel` to `true`:

```Javascript

import {View} from 'react-native';
import { LeafletMap } from 'expo-leaflet-navigation-map';

const App = () => {
    const lat = /* latitude value here*/;
    const long = /*longitude value here*/
    return (
        <View style={{flex:1}}>
            <LeafletMap coordinates = {[lat, long]} 
                markers = {[{ id:1, lat: lat, long: long, title: "My Location"}]} 
                zoom={13} 
                route={{start:[lat, log], end:[target_lat, target_long]}}
                ShowDirectionPanel = {true}
            />
        </View>
    );
}

export default App;
```
