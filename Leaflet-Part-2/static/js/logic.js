// Part 1: Plot earthquakes and tectonic plates data

  // URL of significant earthquakes in the past 7 days
  var earthquakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

  // URL of tectonic plates data
  var platesUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';

  // Use Promise.all to read both JSON files and process them together
  Promise.all([d3.json(earthquakeUrl), d3.json(platesUrl)]).then(([earthquakeData, platesData]) => {
    console.log(earthquakeData);
    console.log(platesData);

    // Create the map
    let baseMaps = {
      "Outdoors": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }),
      "Satellite": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.opentopomap.org/copyright">OpenTopoMap</a> contributors'
      }),
      "Grayscale": L.tileLayer('https://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })
    };

    let overlayMaps = {
      "Earthquakes": L.layerGroup(),
      "Tectonic Plates": L.geoJSON(platesData, {
        style: {
          color: '#ff0000', // Red color for tectonic plates
          weight: 2 // Line weight
        }
      })
    };

    let map = L.map("map", {
      layers: [baseMaps.Outdoors, overlayMaps.Earthquakes] // Set initial layers
    }).setView([0, 0], 2);

    // Function to create a scaled legend
    let legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
      let div = L.DomUtil.create('div', 'info legend');
      let depth = [-10, 10, 30, 50, 70, 90]; // Depth ranges for the legend
      let colors = ['#98ee00','#FFFF00','#FFD700','#FFA500','#FF4500','#DC143C'];
      let legendInfo = "<h4>Depth</h4>";

      // go through each depth item to label and color the legend
      for (var i = 0; i < depth.length; i++) {
        div.innerHTML +=
          "<i style='background: " + colors[i] + "; display: inline-block; width: 10px; height: 10px;'></i> " +
          depth[i] + (depth[i + 1] ? "&ndash;" + depth[i + 1] + "<br>" : "+");
      }

      return div;
    };
    legend.addTo(map);

    // Function to fetch and plot earthquake data on the map
    function plotEarthquakes(earthquakeData) {
      // Loop through the earthquake data and add markers to the map
      earthquakeData.features.forEach(feature => {
        const { coordinates } = feature.geometry;
        const [longitude, latitude, depth] = coordinates;
        const mag = feature.properties.mag;

        // Create a circle marker and add it to the earthquake layer group
        let marker = L.circleMarker([latitude, longitude], {
          radius: getMarkerSize(mag),
          color: getMarkerColor(depth),
          fillColor: getMarkerColor(depth),
          fillOpacity: 0.8
        }).bindPopup(`Magnitude: ${mag}, Depth: ${depth} km`);

        overlayMaps.Earthquakes.addLayer(marker);
      });
    }

    // Function to calculate marker size based on magnitude
    function getMarkerSize(magnitude) {
      return magnitude * 2; // Adjust the multiplier for better visualization
    }

    // Function to calculate marker color based on depth
    function getMarkerColor(depth) {
      // Customize the color scale based on your preference
      if (depth > 90) return '#DC143C'; // red orange for deep earthquakes
      if (depth > 70) return '#FF4500'; // dark orange for deep-moderate earthquakes
      if (depth > 50) return '#FFA500'; // light orange for moderate earthquakes
      if (depth > 30) return '#FFD700'; // dark yellow for moderate-light earthquakes
      if (depth > 10) return '#FFFF00'; // light yellow for light-shallow earthquakes
      return '#98ee00'; // light green for shallow earthquakes
    }

    // Call the functions to plot the earthquakes and tectonic plates data
    plotEarthquakes(earthquakeData);

    // Add layer controls to the map
    L.control.layers(baseMaps, overlayMaps).addTo(map);
    
  });