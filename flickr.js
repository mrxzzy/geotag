var flickrgroup = new L.LayerGroup().addTo(map);
controlLayers.addOverlay(flickrgroup, 'Flickr photos');

var flickr_list = {};

function cleanup_flickr(purge_all) {
  var new_list = {};

  if(purge_all == true){
    flickrgroup.clearLayers();
    flickr_list = new_list;
    return;
  }

  // only delete images not in current map bounds
  for(var image in flickr_list) {
    if(flickr_list.hasOwnProperty(image)) {
      if(!map.getBounds().contains(flickr_list[image].getLatLng())) {
        //console.log("deleting: "+image);
        flickrgroup.removeLayer(flickr_list[image]);

      } else {
        new_list[image] = flickr_list[image]
      }
    }
  }

  flickr_list = new_list;
}

function query_flickr(bbox) {
  console.log("flickr query going..");
  flickrurl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key="+api_keys.FLICKR+"&sort=interestingness-desc&safe_search=1&content_type=1&media=photos&has_geo=1&geo_context=0&extras=geo%2Curl_t%2Curl_s&format=json&per_page=100&nojsoncallback=1";

  flickrbbox = ''+bbox['_southWest']['lng']+','+bbox['_southWest']['lat']+','+bbox['_northEast']['lng']+','+bbox['_northEast']['lat']
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

      //flickrgroup.clearLayers();
      for (var i = 0; i < data.photos.photo.length; i++) {
        var photoContent = data.photos.photo[i];
        if(photoContent.id in flickr_list) {
            //console.log("skipping a photo! "+photoContent.id);
            continue;
        }
        var photoIcon = L.icon({
            iconUrl: photoContent.url_t,
            iconSize: [photoContent.width_t * scale, photoContent.height_t * scale]
        });

        var link = "https://www.flickr.com/photos/"+photoContent.owner+'/'+photoContent.id;

        var marker = new L.marker([photoContent.latitude, photoContent.longitude], {
           icon: photoIcon,
           preview: photoContent.url_s,
           lat: photoContent.latitude,
           lng: photoContent.longitude,
           link: link
        });

        marker.on('mouseover', function() {
          $('#preview').show();
          $('#imgpreview').attr('src',this.options.preview);
          $('#directlink').attr('href',this.options.link);
          make_goog_link(this.options.lat,this.options.lng);
          set_source('Flickr');
        });
        marker.on('click', function() {
          window.open(this.options.link);
        });
        marker.addTo(flickrgroup);
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
