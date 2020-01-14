(function () {

	"use strict";

	//var WIDTH_THRESHOLD = 768;

	var GLOBAL_CLASS_USETOUCH = "touch";
	var SERVICE_URL = "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/merged_retail/FeatureServer/0";
	var STATE = "CA";
	
	var _map;
	var _queryManager;
	var _fg$Starbucks;
	var _fg$DollarGenerals;
	var _fg$Walmarts;
	var _fg$WholeFoods;
	
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
			.addLayer(L.esri.basemapLayer("Imagery"))			
			.addLayer(L.esri.basemapLayer("ImageryLabels"))
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
		
		_fg$DollarGenerals = L.featureGroup().addTo(_map).on("click", onMarkerClick);
		_fg$Starbucks = L.featureGroup().addTo(_map).on("click", onMarkerClick);
		_fg$Walmarts = L.featureGroup().addTo(_map).on("click", onMarkerClick);
		_fg$WholeFoods = L.featureGroup().addTo(_map).on("click", onMarkerClick);

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
				_fg$Starbucks.clearLayers();
				loadFeatureGroup(
					_fg$Starbucks, 
					results, 						
					{radius: 7, color: "white", fillColor: "green", fillOpacity: 1}
				);
				_fg$Starbucks.bringToFront();				
				_map.fitBounds(_fg$Starbucks.getBounds());			
			}
		);
		_queryManager.getWalmarts(
			STATE,
			function(results){
				console.log("Walmarts ", results.length);
				_fg$Walmarts.clearLayers();
				loadFeatureGroup(
					_fg$Walmarts,
					results,
					{radius: 8, color: "white", fillColor: "navy", fillOpacity: 1}
				);
				_fg$Walmarts.bringToFront();
			}
		);
		_queryManager.getDollarGenerals(
			STATE,
			function(results){
				console.log("Dollar Generals ", results.length);
				_fg$DollarGenerals.clearLayers();
				loadFeatureGroup(
					_fg$DollarGenerals, 
					results, 
					{radius: 7, color: "black", fillColor: "yellow", fillOpacity: 1}
				);
				_fg$DollarGenerals.bringToBack();
			}
		);
		_queryManager.getWholeFoods(
			STATE,
			function(results){
				console.log("Whole Foods ", results.length);
				_fg$WholeFoods.clearLayers();
				loadFeatureGroup(
					_fg$WholeFoods, 
					results, 
					{radius: 9, color: "black", fillColor: "red", fillOpacity: 1}
				);
				_fg$WholeFoods.bringToFront();
			}
		);
		
		function loadFeatureGroup(featureGroup, records, options)
		{
			$.each(
				records, 
				function(index, record) {
					L.circleMarker(record.getLatLng(), options)
						.bindPopup(record.getName(), {closeButton: false})
						.bindTooltip(record.getName())
						.addTo(featureGroup);

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