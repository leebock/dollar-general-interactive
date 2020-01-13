(function () {

	"use strict";

	//var WIDTH_THRESHOLD = 768;

	var GLOBAL_CLASS_USETOUCH = "touch";
	var SERVICE_URL = "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/merged_retail/FeatureServer/0";
	var STATE = "FL";
	
	var _map;
	var _queryManager;
	
	var BNDS_LOWER48 = [[24.743, -124.784], [49.345, -66.951]];

	$(document).ready(function() {
		
		console.log(parseArgs());

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
				maxZoom: 12, minZoom: 2, 
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

		// one time check to see if touch is being used

		$(document).one(
			"touchstart", 
			function(){$("html body").addClass(GLOBAL_CLASS_USETOUCH);}
		);
		
		console.log(STATE);
		_queryManager = new QueryManager(SERVICE_URL);
		_queryManager.getStarbucks(
			STATE, 
			function(results){console.log("Starbucks: ", results.length);}
		);
		_queryManager.getWalmarts(
			STATE,
			function(results){console.log("Walmarts ", results.length);}
		);
		_queryManager.getDollarGenerals(
			STATE,
			function(results){console.log("Dollar Generals ", results.length);}
		);
		_queryManager.getWholeFoods(
			STATE,
			function(results){console.log("Whole Foods ", results.length);}
		);

	});

	/***************************************************************************
	********************** EVENTS that affect selection ************************
	***************************************************************************/


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