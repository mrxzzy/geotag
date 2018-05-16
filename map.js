//max markers to allow per layer
var marker_max = 200;
var elevator = 'asdf';

function initMap() {
  var goog = new google.maps.Map(document.getElementById('goog'), {
    zoom: 0,
    center: {lat: 38.56, lng: -96.28},
    mapTypeId: 'terrain'
  });
  elevator = new google.maps.ElevationService;
  console.log('goog init done');
}

scroll_boundary = L.latLngBounds( L.latLng(-180,-180), L.latLng(180,180) );

var map = L.map('map', {
  center: [38.5612503,-96.2895463],
  zoom: 5,
  zoomControl: false,
  contextmenu: true,
  contextmenuWidth: 200,
  contextmenuItems: [{
    text: 'Elevation',
    callback: googleElevation
  }],
  maxBounds:  scroll_boundary
});

map.on({
  overlayremove: function(e) {
    if(e.name == 'Flickr photos') {
      cleanup_flickr(true);
    }
  }
});

function sourcelink(e) {
  var marker = e.relatedTarget;
  window.open(marker.options.link);
}

function mapslink(e) {
  var marker = e.relatedTarget;
  var lat = marker.options.lat;
  var lng = marker.options.lng;
  var link = 'https://www.google.com/maps/place/'+lat+','+lng+'/@'+lat+','+lng+',15z/data=!3m1!1e3'
  window.open(link);
}

function googleElevation(e) {
  var result = 'query failed'
  if(e.hasOwnProperty('relatedTarget')) {
    //var latlng = {'lat': e.relatedTarget.options.lat, 'lng': e.relatedTarget.options.lng};
    var latlng = e.relatedTarget._latlng;
  } else {
    var latlng = e.latlng;
  }
  elevator.getElevationForLocations({
    'locations': [latlng]
  }, function(results, status) {
    if(status === 'OK') {
      if(results[0]) {
        result = results[0].elevation + ' meters';
        //console.log("win: " +  results[0].elevation + '@ ' + latlng.lat + ' ' + latlng.lng);
      } else {
        result = 'no data for this location'
        //console.log("lose");
      }
    } else {
      result = 'query failure: ' + status;
      //console.log('elevation query failed because: ' + status);
    }

    $('#elevation').text(result);
  });
}

oms_opts = {
  keepSpiderfied: true,
  nearbyDistance: 80,
}

var oms = new OverlappingMarkerSpiderfier(map,oms_opts);

// run when user clicks on an image icon that has been spiderfied
// all run on markers that do not need to be spiderfied
oms.addListener('click', function(marker) {
  window.open(marker.options.link);
});
oms.addListener('mouseover', function(marker) {
  $('#preview').show();
  $('#imgpreview').attr('src',marker.options.preview);
  $('#directlink').attr('href',marker.options.link);
  make_goog_link(marker.options.lat,marker.options.lng);
  set_source(marker.options.source);
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
  var sw = bnds.getSouthWest().wrap();
  var ne = bnds.getNorthEast().wrap();

  var center = map.getCenter();

  lat = center.lat;
  lng = center.lng;

  query_flickr(bnds);
}

$(document).ready(function () {

  map.on('load moveend', _.debounce(run_queries, 1000));

  $.getScript("https://maps.googleapis.com/maps/api/js?key="+api_keys.GOOG+"&callback=initMap", function(data, textStatus, jqxhr) {
    console.log("goog init:" + textStatus);
  });

});


function make_goog_link(lat,lng) {
    var link = 'https://www.google.com/maps/place/'+lat+','+lng+'/@'+lat+','+lng+',15z/data=!3m1!1e3'
    $('#googmaps').attr('href',link).text(lat+','+lng);
}

function set_source(src) {
    $('#imgsrc').text(src);
}
