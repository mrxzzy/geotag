//var flickrgroup = new L.LayerGroup().addTo(map);
var flickrgroup = new L.FeatureGroup().addTo(map);
controlLayers.addOverlay(flickrgroup, 'Flickr photos');

var flickr_list = {};

flickrgroup.on('mouseover', function(event) {
  var marker = event.layer;
  $('#preview').show();
  $('#imgpreview').attr('src',marker.options.preview);
  $('#directlink').attr('href',marker.options.link);
  make_goog_link(marker.options.lat,marker.options.lng);
  set_source(marker.options.source);
});

function cleanup_flickr(purge_all) {
  var new_list = {};

  if(purge_all == true){
    for(var image in flickr_list) {
      if(flickr_list.hasOwnProperty(image)) {
        oms.removeMarker(flickr_list[image]);
      }
    }
    flickrgroup.clearLayers();
    flickr_list = new_list;
    return;
  }

  // only delete images not in current map bounds
  for(var image in flickr_list) {
    if(flickr_list.hasOwnProperty(image)) {
      var marker = flickr_list[image];
      if(!map.getBounds().contains(marker.getLatLng())) {
        //console.log("deleting: "+image);
        flickrgroup.removeLayer(marker);
        oms.removeMarker(marker);

      } else {
        new_list[image] = marker;
      }
    }
  }

  flickr_list = new_list;
}

function query_flickr(bbox) {
  console.log("flickr query going..");
  var unixtime = Math.round((new Date()).getTime() / 1000);

  var interval = unixtime - (86400 * 30 * 2);

  flickrurl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key="+api_keys.FLICKR+"&sort=interestingness-desc&safe_search=1&content_type=1&media=photos&has_geo=1&geo_context=0&extras=geo%2Ctags%2Cmachine_tags%2Curl_t%2Curl_s&format=json&per_page=100&nojsoncallback=1";
  //flickrurl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key="+api_keys.FLICKR+"&sort=interestingness-desc&safe_search=1&content_type=1&media=photos&has_geo=1&geo_context=0&extras=geo%2Ctags%2Cmachine_tags%2Curl_t%2Curl_s&format=json&per_page=100&nojsoncallback=1&tags=outdoors,landscape,mountain";
  //flickrurl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key="+api_keys.FLICKR+"&sort=interestingness-desc&safe_search=1&content_type=1&media=photos&has_geo=1&geo_context=0&extras=geo%2Ctags%2Cmachine_tags%2Curl_t%2Curl_s&format=json&per_page=100&nojsoncallback=1&min_taken_date="+interval;

  flickrbbox = ''+bbox['_southWest']['lng']+','+bbox['_southWest']['lat']+','+bbox['_northEast']['lng']+','+bbox['_northEast']['lat']
  //  flickrbbox = ''+sw['lng']+','+sw['lat']+','+ne['lng']+','+ne['lat']

  finalurl = flickrurl+'&bbox='+flickrbbox

  $.ajax({
    dataType: "json",
    url: finalurl,
    success: function(data) {
      var scale = 0.4;

      // if the list of markers is getting huge, purge stuff that's out of view
      if(Object.keys(flickr_list).length > marker_max) {
        cleanup_flickr(false);
      }


      for (var i = 0; i < data.photos.photo.length; i++) {
        var photoContent = data.photos.photo[i];

        // don't make a marker if image already has one
        if(photoContent.id in flickr_list) {
            //console.log("skipping a photo! "+photoContent.id);
            continue;
        }
        var photoIcon = L.icon({
            iconUrl: photoContent.url_t,
            iconSize: [photoContent.width_t * scale, photoContent.height_t * scale]
        });

        var link = "https://www.flickr.com/photos/"+photoContent.owner+'/'+photoContent.id;

        //console.log(photoContent);
        var marker = new L.marker([photoContent.latitude, photoContent.longitude], {
           icon: photoIcon,
           preview: photoContent.url_s,
           lat: photoContent.latitude,
           lng: photoContent.longitude,
           link: link,
           source: 'Flickr',
           contextmenu: true,
           contextmenuItems: [{
             text: 'Visit Flickr Source',
             callback: sourcelink,
             index: 0
           },{
             text: 'Visit here in Google Maps',
             callback: mapslink,
             index: 1
           }]
        });

        marker.addTo(flickrgroup);
        oms.addMarker(marker);
        flickr_list[photoContent.id] = marker;
      }
    },
    error: function(xhr,status,errorThrown) {
      console.log("Error pulling from flickr:");
      console.log("Type: " + errorThrown);
      console.log("Status: " + status);
    }
  });
}
