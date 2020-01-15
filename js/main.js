(function () {

	"use strict";

	//var WIDTH_THRESHOLD = 768;

	var GLOBAL_CLASS_USETOUCH = "touch";
	var SERVICE_URL = "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/merged_retail/FeatureServer/0";
	
	var _map;
	var _queryManager;
	var _states;
	
	var _fg$Starbucks;
	var _fg$DollarGenerals;
	var _fg$Walmarts;
	var _fg$WholeFoods;
	
	var BNDS_LOWER48 = [[24.743, -124.784], [49.345, -66.951]];

	$(document).ready(function() {
		
		if (!inIframe()) {
			new SocialButtonBar();
		} else {
			$(".banner").hide();
		}
				
		_map = new L.PaddingAwareMap(
			"map", 
			{
				zoomControl: !L.Browser.mobile, 
				attributionControl: false, 
				maxZoom: 16, minZoom: 2, 
				worldCopyJump: true
			},
			getExtentPadding			
		)			
			.addLayer(L.esri.basemapLayer("Imagery"))			
			.addLayer(L.esri.basemapLayer("ImageryLabels"))
			.addControl(L.control.attribution({position: 'bottomleft'}))
			.on("moveend", onExtentChange);

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
		
		$.getJSON(
	        "resources/states.json", 
	        function(data) {
				_states = $.map(data, function(value){return new State(value);});
				_states = $.grep(
					_states, 
					function(value) {
						return ["GU", "MP", "AS", "VI"].indexOf(value.getAbbreviation()) === -1;
					}
				);
				$.each(
					_states, 
					function(index, value) {
						$("<option>")
							.attr("value", value.getAbbreviation())
							.text(value.getName())
							.appendTo($("#info select"));
					}
				);

				var STATE = parseArgs().state;

				if (
					$.grep(
						_states, 
						function(value) {
							return value.getAbbreviation().toLowerCase() === STATE;
						}
					).length
				) {
					STATE = STATE.toUpperCase();
				} else {
					STATE = "VA";
				}
				
				$("#info select").val(STATE);
				
				$("#info select").change(
					function() {
						process();
					}
				);
				
				process();
				
	        }
	    );				
				

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
	**************************** MASTER FUNCTION *******************************
	***************************************************************************/
		
	function process()
	{

		var STATE = $("#info select").val();
		
		$("#info ul").empty();
		
		var state = $.grep(
			_states, 
			function(value) {
				return value.getAbbreviation() === STATE;
			}
		).shift(); 
		
		_map.fitBounds(state.getBounds());			
		
		_queryManager.getStarbucks(
			STATE, 
			function(results){
				$("#info ul").append($("<li>").html("Starbucks: "+results.length));
				_fg$Starbucks.clearLayers();
				loadFeatureGroup(
					_fg$Starbucks, 
					results, 						
					{radius: 7, color: "white", fillColor: "green", fillOpacity: 1}
				);
				finish();
			}
		);
		
		_queryManager.getWalmarts(
			STATE,
			function(results){
				$("#info ul").append($("<li>").html("Walmarts: "+results.length));
				_fg$Walmarts.clearLayers();
				loadFeatureGroup(
					_fg$Walmarts,
					results,
					{radius: 8, color: "white", fillColor: "navy", fillOpacity: 1}
				);
				finish();
			}
		);
		
		_queryManager.getDollarGenerals(
			STATE,
			function(results){
				$("#info ul").append($("<li>").html("Dollar Generals: "+results.length));
				_fg$DollarGenerals.clearLayers();
				loadFeatureGroup(
					_fg$DollarGenerals, 
					results, 
					{radius: 7, color: "black", fillColor: "yellow", fillOpacity: 1}
				);
				finish();
			}
		);
		
		_queryManager.getWholeFoods(
			STATE,
			function(results){
				$("#info ul").append($("<li>").html("Whole Foods: "+results.length));
				_fg$WholeFoods.clearLayers();
				loadFeatureGroup(
					_fg$WholeFoods, 
					results, 
					{radius: 9, color: "black", fillColor: "red", fillOpacity: 1}
				);
				finish();
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
		
		function finish()
		{
			_fg$DollarGenerals.bringToBack();
			_fg$Starbucks.bringToFront();				
			_fg$Walmarts.bringToFront();
			_fg$WholeFoods.bringToFront();
		}
		
	}

	/***************************************************************************
	******************************** FUNCTIONS *********************************
	***************************************************************************/
	
	function getExtentPadding()
	{
		/*
		var landscape = ($(window).width() / $(window).height()) >= 1;
		var top = landscape ? 
					0 : 
					!$("#blurb").hasClass("hidden") ? $("#blurb").outerHeight() : 0;
		var right = landscape ? 
						!$("#blurb").hasClass("hidden") ? 
							$(window).width() - $("#blurb").position().left : 
							0 :
						0;
		*/
		var top = 0;
		var right = $("#main").width() - $("#info").position().left;
		var bottom = 0;
		var left = 0;
		return {paddingTopLeft: [left,top], paddingBottomRight: [right,bottom]};
	}	
	
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