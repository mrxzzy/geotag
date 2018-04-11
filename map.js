//max markers to allow per layer
var marker_max = 200;

var map = L.map('map', {
  center: [38.5612503,-96.2895463],
  zoom: 5,
  zoomControl: false
});

map.on({
  overlayremove: function(e) {
    if(e.name == 'Flickr photos') {
      cleanup_flickr(true);
    }
    if(e.name == '500px photos') {
      cleanup_500px(true);
    }
  }
});

var controlLayers = L.control.layers( null, null, {
  position: "bottomright",
  collapsed: false
}).addTo(map);

L.control.zoom({position: "topright"}).addTo(map);

var googSat = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
  maxZoom: 24,
  subdomains:['mt0','mt1','mt2','mt3'],
  attribution: '<a href="https://maps.google.com/">Google Maps</a>',
});
var googTerrain = L.tileLayer('https://{s}.google.com/vt/lyrs=t&x={x}&y={y}&z={z}',{
  maxZoom: 24,
  subdomains:['mt0','mt1','mt2','mt3'],
  attribution: '<a href="https://maps.google.com/">Google Maps</a>',
});
var googStreet = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
  maxZoom: 24,
  subdomains:['mt0','mt1','mt2','mt3'],
  attribution: '<a href="https://maps.google.com/">Google Maps</a>',
}).addTo(map);

var mapbxSat = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  maxZoom: 24,
  accessToken: api_keys.MAPBOX,
  id: 'satellite-streets-v9',
  attribution: '<a href="https://mapbox.com">Mapbox</a>',
});

controlLayers.addBaseLayer(googSat,'Google Satellite');
controlLayers.addBaseLayer(googTerrain,'Google Terrain');
controlLayers.addBaseLayer(googStreet,'Google Street');
controlLayers.addBaseLayer(mapbxSat,'Mapbox Satellite');

function run_queries() {

  var bnds = map.getBounds();
  var center = map.getCenter();

  lat = center.lat;
  lng = center.lng;

  query_flickr(bnds);
  query_px(center);
}

$(document).ready(function () {

  map.on('load moveend', _.debounce(run_queries, 1000));

});


function make_goog_link(lat,lng) {
    var link = 'https://www.google.com/maps/place/'+lat+','+lng+'/@'+lat+','+lng+',15z/data=!3m1!1e3'
    $('#googmaps').attr('href',link).text(lat+','+lng);
}

function set_source(src) {
    $('#imgsrc').text(src);
}
