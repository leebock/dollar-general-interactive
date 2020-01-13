(function () {

	"use strict";

	//var WIDTH_THRESHOLD = 768;

	var GLOBAL_CLASS_USETOUCH = "touch";
	var SERVICE_URL = "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/merged_retail/FeatureServer/0";
	var STATE = "CA";
	
	var _map;
	var _queryManager;
	var _layerStarbucks;
	var _layerDollarGenerals;
	
	var BNDS_LOWER48 = [[24.743, -124.784], [49.345, -66.951]];

	$(document).ready(function() {
		
		STATE = parseArgs().state || STATE;
		STATE = STATE.toUpperCase();

		if (!inIframe()) {
			new SocialButtonBar();
		} else {
			$(".banner").hide();
		}
				
		_map = new L.Map(
			"map", 
			{
				zoomControl: !L.Browser.mobile, 
				attributionControl: false, 
				maxZoom: 16, minZoom: 2, 
				worldCopyJump: true
			}
		)
			.addLayer(L.esri.basemapLayer("NationalGeographic"))			
			.addControl(L.control.attribution({position: 'bottomleft'}))
			.on("moveend", onExtentChange)
			.fitBounds(BNDS_LOWER48);

		if (!L.Browser.mobile) {
			L.easyButton({
				states:[
					{
						icon: "fa fa-home",
						onClick: function(btn, map){
							_map.fitBounds(BNDS_LOWER48);
						},
						title: "Full extent"
					}
				]
			}).addTo(_map);			
		}
		
		_layerStarbucks = L.featureGroup()
			.addTo(_map)
			.on("click", onMarkerClick);

		_layerDollarGenerals = L.featureGroup()
			.addTo(_map)
			.on("click", onMarkerClick);

		// one time check to see if touch is being used

		$(document).one(
			"touchstart", 
			function(){$("html body").addClass(GLOBAL_CLASS_USETOUCH);}
		);
		
		_queryManager = new QueryManager(SERVICE_URL);
		_queryManager.getStarbucks(
			STATE, 
			function(results){
				console.log("Starbucks: ", results.length);
				_layerStarbucks.clearLayers();
				loadFeatureGroup(
					_layerStarbucks, 
					results, 						
					{radius: 7, color: "white", fillColor: "green", fillOpacity: 1}
				);
				_map.flyToBounds(_layerStarbucks.getBounds());			
			}
		);
		_queryManager.getWalmarts(
			STATE,
			function(results){console.log("Walmarts ", results.length);}
		);
		_queryManager.getDollarGenerals(
			STATE,
			function(results){
				console.log("Dollar Generals ", results.length);
				_layerDollarGenerals.clearLayers();
				loadFeatureGroup(
					_layerDollarGenerals, 
					results, 
					{radius: 7, color: "black", fillColor: "yellow", fillOpacity: 1}
				);
			}
		);
		_queryManager.getWholeFoods(
			STATE,
			function(results){console.log("Whole Foods ", results.length);}
		);
		
		function loadFeatureGroup(featureGroup, records, options)
		{
			$.each(
				records, 
				function(index, record) {
					L.circleMarker(record.getLatLng(), options)
						.bindPopup(record.getName(), {closeButton: false})
						.bindTooltip(record.getName())
						.addTo(_layerStarbucks);

				}
			);	
		}

	});

	/***************************************************************************
	********************** EVENTS that affect selection ************************
	***************************************************************************/
	
	function onMarkerClick(e)
	{
		$(".leaflet-tooltip").remove();
	}

	/***************************************************************************
	**************************** EVENTS (other) ********************************
	***************************************************************************/

	function onExtentChange()
	{
	}

	/***************************************************************************
	******************************** FUNCTIONS *********************************
	***************************************************************************/
	
	function inIframe () {
		try {
			return window.self !== window.top;
		} catch (e) {
			return true;
		}
	}		

	
	function parseArgs()
	{
		
		var parts = decodeURIComponent(document.location.href).split("?");
		var args = {};
		
		if (parts.length > 1) {
			args = parts[1].toLowerCase().split("&").reduce(
				function(accumulator, value) {
					var temp = value.split("=");
					if (temp.length > 1) {accumulator[temp[0]] = temp[1];}
					return accumulator; 
				}, 
				args
			);
		}

		return args;
	
	}	

})();