var pxgroup = new L.LayerGroup().addTo(map);
controlLayers.addOverlay(pxgroup, '500px photos');

var px_list = {};

function cleanup_500px(purge_all) {
  var new_list = {};

  if(purge_all == true){
    pxgroup.clearLayers();
    px_list = new_list;
    return;
  }

  // only delete images not in current map bounds
  for(var image in px_list) {
    if(px_list.hasOwnProperty(image)) {
      if(!map.getBounds().contains(px_list[image].getLatLng())) {
        //console.log("deleting: "+image);
        pxgroup.removeLayer(px_list[image]);

      } else {
        new_list[image] = px_list[image]
      }
    }
  }

  px_list = new_list;
}

function query_px(center) {
  console.log('500px query..');

  //https://stackoverflow.com/questions/27545098/leaflet-calculating-meters-per-pixel-at-zoom-level
  pC = map.latLngToContainerPoint(center);
  pX = [pC.x+1,pC.y];
  pY = [pC.x,pC.y+1];

  llc = map.containerPointToLatLng(pC);
  llx = map.containerPointToLatLng(pX);
  lly = map.containerPointToLatLng(pY);

  dX = llc.distanceTo(llx);
  dY = llc.distanceTo(lly);

  km = dX / 1000;

  mapsize = map.getSize();

  radius = (mapsize.y * 0.5) * km;
  lat = center['lat'];
  lng = center['lng'];

  pxurl = 'https://api.500px.com/v1/photos/search?geo='+lat+','+lng+','+radius+'km&exclude_nude=1&image_size=1,30,rpp=100&consumer_key='+api_keys.FIVEPX;

  $.ajax({
    dataType: "json",
    url: pxurl,
    success: function(data) {

      // if the list of markers is getting huge, purge stuff that's out of view
      if(Object.keys(px_list).length > marker_max) {
        cleanup_500px(false);
      }

      for(var i = 0; i < data.photos.length; i++) {
		photoContent = data.photos[i];
        var thumb = photoContent.images[0].url;
        var preview = photoContent.images[1].url;
        var link = 'https://500px.com'+photoContent.url;

        if(photoContent.id in px_list) {
          //console.log("skipping a photo! "+photoContent.id);
          continue;
        }

        var icon = L.icon({
          iconUrl: thumb,
          iconSize: [40,40]
        });

        var marker = new L.marker([photoContent.latitude, photoContent.longitude], {
          icon: icon,
          preview: preview,
          link: link,
          lat: photoContent.latitude,
          lng: photoContent.longitude
        });

        marker.on('mouseover', function() {
          $('#preview').show();
          $('#imgpreview').attr('src',this.options.preview);
          $('#directlink').attr('href',this.options.link);
          set_source('500px');
          make_goog_link(this.options.lat,this.options.lng);
        });
        marker.on('click', function () {
          window.open(this.options.link);
        });

        marker.addTo(pxgroup);
        px_list[photoContent.id] = marker;
      }
      //console.log("500px size: "+Object.keys(px_list).length);
    },
    error: function(xhr,status,errorThrown) {
      console.log("Error pulling from 500px:");
      console.log("Type: " + errorThrown);
      console.log("Status: " + status);
    }
  });
}
