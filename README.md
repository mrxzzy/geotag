
# Geotagged Images Browser

A pretty simple map browser based on leaflet that uses the flickr API to find geotagged images and arrange them on a map. Mission is to make it easier to scout out photography destinations.

![screenshot of geotag in web browser](https://i.imgur.com/NRMDbCq.png)

## Dependencies

* jquery (written against 3.2.1 but I figure any version will work)
* leaflet (written against 1.1.0) 
* lodash.js
* OverlappingMarkerSpiderfier (https://github.com/jawj/OverlappingMarkerSpiderfier-Leaflet)
* Leaflet.contextmenu (https://github.com/aratcliffe/Leaflet.contextmenu)
* Leaflet Coordiantes Control (https://github.com/zimmicz/Leaflet-Coordinates-Control)

## Usage

Clone the repo, find copies of the dependencies, and drop them in the directory. Or edit index.html and adjust the script sources for copies you already have. Don't forget to install a leaflest CSS file as well. 

You will need to create **./keys.js** to store your api keys. You'll need to register with flickr and mapbox. You can get away without mapbox, but sometimes they have better satellite imagery than google so it's probably worth the effort to keep them as an option. File contents should look like:

```javascript
var api_keys = {
  FLICKR : 'your flickr api key',
  GOOG :   'google api key, to query elevation data',
  MAPBOX : 'yep a mapbox key as well'
}
```

One other value perhaps of interest is **marker_max** in map.js. This controls how many icons to keep in memory and defaults to 200. It runs okay as high as 500 but a little chugging starts to become apparent. Once the markers get over this threshold it will start purging offscreen entries. 

## The Google Maps Problem

I wanted to include street map images and the newer "google maps photos" that has apparently replaced Panoramio in the Google Earth app, but their API is pretty hostile to this kind of tool. Panoramio is completely gone now, and the ability to search images with a bounding box is deprecated too. That's why the UI includes a link to google maps over on the right side, so those photos can still be explored even though it's a big pain.

## 500px Gone

500px is killing off their API in June 2018. To "focus our energy on continuing to build the world's best photography community." Whatever, enjoy your Chinese overloards. The 500px layers are now removed from this tool.


