// Mapa Leaflet
var mapa = L.map('mapid').setView([9.8, -84.25], 7);

// Definición de capas base
var capas_base = {
	
  // Capa base agregada mediante L.tileLayer
  "OSM": L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?', 
    {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  ),

  // Capa base agregada mediante L.tileLayer y leaflet-providers
  "Stamen.Watercolor": L.tileLayer.provider('Stamen.Watercolor'), 
  // Capa extra 1
  "CartoDB.Voyager": L.tileLayer.provider('CartoDB.Voyager'),
  // Capa extra 2
   "Esri.WorldStreetMap": L.tileLayer.provider('Esri.WorldStreetMap'),
 
  // Agregar capa WMS Mundialis
	
   "Topográfico-WMS": L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
	layers: 'TOPO-OSM-WMS',
	format: 'image/png',
	transparent: true
  }),
  
 // Agregar capa WMS Mundialis
	"Sombras-WMS": L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
	layers: 'SRTM30-Hillshade',
	format: 'image/png',
	transparent: true 
  }),
  
  
  	// Agregar capa WMS cobetura arborea SNIT
	"Cobertura Arborea 2018-WMS": L.tileLayer.wms('https://monitoreo.prias.cenat.ac.cr/geoserver/MonitoreoCA/wms?', {
	layers: 'Paisaje_Cobertura_Arborea_2018',
	format: 'image/png',
	transparent: true
	}),
	
	
	// Agregar capa WMS areas esenciales para soporte biodiversidad
	"Áreas esenciales para el soporte de biodiversidad-WMS": L.tileLayer.wms('https://monitoreo.prias.cenat.ac.cr/geoserver/Cartografia/wms?', {
	layers: 'Areas_Esenciales_para_el_soporte_de_la_biodiversidad',
	format: 'image/png',
	transparent: true
	})

	
}
	


// Se agregan todas las capas base al mapa
control_capas = L.control.layers(capas_base).addTo(mapa);

// Se activa una capa base del control
capas_base['OSM'].addTo(mapa);	

// Control de escala
L.control.scale().addTo(mapa);

	

// Capa vectorial en formato GeoJSON DENUNCIAS
	$.getJSON("https://maureenarg.github.io/datostarea/denuncias.geojson", function(geodata) {
		var denuncias = L.geoJson(geodata, {
			pointToLayer: function(feature, lating) {
				return L.circleMarker (lating, { radius:4, fillcolor: "#fc032d", color: "#fc032d", weight: 0.5, opacity: 1, fillOpacity: 0.8
	});
	
		},	
    onEachFeature: function(feature, layer) {
		var popupText = "<strong>Categoría</strong>: " + feature.properties.CATEGORIA_;
		layer.bindPopup(popupText);
		}			
	}).addTo(mapa);
	
	control_capas.addOverlay(denuncias, 'Denuncias');
	});	
		
	
	
	// Capa vectorial en formato GeoJSON RIOS
	$.getJSON("https://maureenarg.github.io/datostarea/rios.geojson", function(geodata) {
		var rios = L.geoJson(geodata, {
		style: function(feature) {
				return {'color': "#1703fc", 'weight': 2.5, 'fillOpacity': 0.0}
		},
    onEachFeature: function(feature, layer) {
		var popupText = "<strong>Nombre</strong>: " + feature.properties.NOMBRE;
		layer.bindPopup(popupText);
		}			
	}).addTo(mapa);

	control_capas.addOverlay(rios, 'Ríos').addTo(mapa);
	});	
	


// Capa raster de bio13
var capa_bio13 = L.imageOverlay("https://raw.githubusercontent.com/MaureenArg/datostarea/master/bio_13.png", 
	[[11.2182124295523433, -87.0996671226630781], 
	[5.5029808209751785, -82.5564197173637666]], 
	{opacity:0.3}
).addTo(mapa);

control_capas.addOverlay(capa_bio13, 'Precipitación del mes más húmedo');

function updateOpacitybio13() {
  document.getElementById("span-opacity-bio13").innerHTML = document.getElementById("sld-opacity-bio13").value;
  capa_bio13.setOpacity(document.getElementById("sld-opacity-bio13").value);

}




// Capa de coropletas AREA DE CUENCAS
$.getJSON('https://raw.githubusercontent.com/MaureenArg/datostarea/master/cuencas.geojson', function (geojson) {
  var capa_cuencas = L.choropleth(geojson, {
	  valueProperty: 'AREA',
	  scale: ['yellow', 'green'],
	  steps: 5,
	  mode: 'q',
	  style: {
	    color: '#fff',
	    weight: 2,
	    fillOpacity: 0.6
	  },
	  onEachFeature: function (feature, layer) {
	    layer.bindPopup('Nombre cuenca: ' + feature.properties.NOMBRE + '<br>' + 'Area: ' + feature.properties.AREA.toLocaleString() + 'm2')
	  }
  }).addTo(mapa);
  control_capas.addOverlay(capa_cuencas, 'Area de cuencas (m2)');	

  // Leyenda de la capa de coropletas
  var leyenda = L.control({ position: 'bottomleft' })
  leyenda.onAdd = function (mapa) {
    var div = L.DomUtil.create('div', 'info legend')
    var limits = capa_cuencas.options.limits
    var colors = capa_cuencas.options.colors
    var labels = []

    // Add min & max
    div.innerHTML = '<div class="labels"><div class="min">' + limits[0] + '</div> \
			<div class="max">' + limits[limits.length - 1] + '</div></div>'

    limits.forEach(function (limit, index) {
      labels.push('<li style="background-color: ' + colors[index] + '"></li>')
    })

    div.innerHTML += '<ul>' + labels.join('') + '</ul>'
    return div
  }
  leyenda.addTo(mapa)
});
