

require([
  "esri/config",
  "esri/Map",
  "esri/views/MapView",

  "esri/Graphic",
  "esri/layers/GraphicsLayer",
], function (esriConfig, Map, MapView, Graphic, GraphicsLayer) {
  esriConfig.apiKey =
    "AAPK8dd52abd5aca4d04bd879557d2466ccfwKOgqouyrHLrpxuKSIWQTQMHm-YCwJsIrmezfpQIyALz_vtr2htDeNdLspXb3Ajn";

  const map = new Map({
    basemap: "arcgis-topographic", //Basemap layer service
  });

  const view = new MapView({
    map: map,
    center: [-96.407175, 37.643054], //Longitude, latitude
    zoom: 5,
    container: "viewDiv",
  });

  const graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);

  const popupTemplatePoint = {
    title: "{Name}",
  };
  const attributesPoint = {
    Name: "LAX International Airport",
  };
  const point = {
    //Create a point
    type: "point",
    longitude: -118.4085,
    latitude: 33.9416,
  };
  const simpleMarkerSymbol = {
    type: "simple-marker",
    color: [226, 119, 40], // Orange
    outline: {
      color: [255, 255, 255], // White
      width: 1,
    },
  };

  const pointGraphic = new Graphic({
    geometry: point,
    symbol: simpleMarkerSymbol,

    popupTemplate: popupTemplatePoint,
    attributes: attributesPoint,
  });
  graphicsLayer.add(pointGraphic);

  // We will use the XMLHttpRequest object to read data from the USGS
  // server and populate graphics on our map based on the results
  // https://www.w3schools.com/js/js_ajax_http.asp
  var xmlhttp = new XMLHttpRequest();

  // This long function below is what will happen when we get a result
  // The actual sending of the http request and reading response occurs
  // after the definition of this function.
  xmlhttp.onreadystatechange = function () {
    // Did we get a response (4) and was the response successful (200)
    if (this.readyState == 4 && this.status == 200) {
      // Convert the JSON text to JSON object that we
      // can loop through
      var data = JSON.parse(this.responseText);

      // Loop through each feature in the features list
      for (feature of data.data) {
        // Define location to draw
        // This JS map is expected by ArcGIS to make a graphic
        if (feature.live != null) {
          if (feature.live.is_ground == false) {
            console.log(feature)
            var point = {
              type: "point",
              longitude: feature.live.longitude,
              latitude: feature.live.latitude,
            };

            // Create a symbol
            // This JS map is expected by ArcGIS to make a graphic
            var simpleMarkerSymbol = {
              type: "simple-marker",
              color: [100, 200, 300],
              outline: {
                color: [255, 255, 255], // white
                width: 1,
              },
            };

            // Combine location and symbol to create a graphic object
            // Also include the earthquake properties data so it
            // can be used in the popup template.
            var pointGraphic = new Graphic({
              geometry: point,
              symbol: simpleMarkerSymbol,
              attributes: feature.properties, // this is just a JS Map
            });

            // Add popup.  The items in curly braces within the
            // template are the key names from the graphic attributes.
            // pointGraphic.popupTemplate = {
            //   title: "Flight",
            //   content: "Details",
            // };

            pointGraphic.popupTemplate = {
              title: "Flight {name} - {airline}",
              content: "<p>Departed from: <b>{dep_airport} - {iata}.</b><br>" +
                       "Altitude: <b>{altitude} M</b>.<br>" +
                       "Speed: <b>{speed} KM/H</b>.</p>"
            };
            pointGraphic.attributes = {
              name: feature.flight.iata,
              dep_airport: feature.departure.airport,
              airline: feature.airline.name,
              iata: feature.departure.iata,
              altitude: feature.live.altitude,
              speed: feature.live.speed_horizontal,
            };

            // Add the graphic (with its popup) to the graphics layer
            graphicsLayer.add(pointGraphic);
          }
        }
      } // End of Loop
    }
  }; // End of XML Call back Function

  // Time to actually send the GET request to the USGS.  When we get a response
  // it will call and execute the function we defined above.
  xmlhttp.open(
    "GET",
    'http://api.aviationstack.com/v1/flights?access_key=631d2eb152c49ea5c2808d97db9dc10d&arr_iata=lax&flight_status=active',
    true
  );
  xmlhttp.send();
});
