(function () {

	"use strict";

	//var WIDTH_THRESHOLD = 768;

	var GLOBAL_CLASS_USETOUCH = "touch";
	
	var SERVICE_URL_STARBUCKS = "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/infogroup012020_starbucks/FeatureServer/0";
	var SERVICE_URL_WALMART = "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/infogroup012020_walmart/FeatureServer/0";
	var SERVICE_URL_DOLLARGENERAL = "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/infogroup012020_dollargeneral/FeatureServer/0";
	var SERVICE_URL_WHOLEFOODS = "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/infogroup012020_wholefoods/FeatureServer/0";
	
	var _map;
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
				maxZoom: 17, minZoom: 2, 
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
		_fg$Walmarts = L.featureGroup().on("click", onMarkerClick);
		_fg$WholeFoods = L.featureGroup().on("click", onMarkerClick);

		// one time check to see if touch is being used

		$(document).one(
			"touchstart", 
			function(){$("html body").addClass(GLOBAL_CLASS_USETOUCH);}
		);

		$.getJSON(
	        "resources/states.json", 
	        function(data) {
				_states = $.map(data, function(value){return new State(value);});
				_states = $.grep(
					_states, 
					function(value) {
						return ["GU", "MP", "AS", "VI", "PR"].indexOf(value.getAbbreviation()) === -1;
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
		_fg$Starbucks.clearLayers();
		_fg$Walmarts.clearLayers();
		_fg$DollarGenerals.clearLayers();
		_fg$WholeFoods.clearLayers();
		
		var state = $.grep(
			_states, 
			function(value) {
				return value.getAbbreviation() === STATE;
			}
		).shift(); 
		
		_map.fitBounds(state.getBounds());			
		
		new QueryManager(SERVICE_URL_STARBUCKS).getRecords(
			STATE, 
			function(results){
				$("#info ul").append(
					$("<li>")
						.addClass("starbucks")
						.addClass(_map.hasLayer(_fg$Starbucks) ? "" : "inactive")
						.append(
							$("<button>")
								.html("Starbucks: "+results.length)
								.click(button_click)
						)
				);
				loadFeatureGroup(
					_fg$Starbucks, 
					results, 						
					{radius: 7, color: "white", fillColor: "green", fillOpacity: 1}
				);
				finish();
			}
		);
		
		new QueryManager(SERVICE_URL_WALMART).getRecords(
			STATE,
			function(results){
				$("#info ul").append(
					$("<li>")
						.addClass("walmart")
						.addClass(_map.hasLayer(_fg$Walmarts) ? "" : "inactive")
						.append(
							$("<button>")
								.html("Walmarts: "+results.length)
								.click(button_click)
						)
				);
				loadFeatureGroup(
					_fg$Walmarts,
					results,
					{radius: 8, color: "white", fillColor: "navy", fillOpacity: 1}
				);
				finish();
			}
		);
		
		new QueryManager(SERVICE_URL_DOLLARGENERAL).getRecords(
			STATE,
			function(results){
				$("#info ul").append(
					$("<li>")
						.addClass("dollar-general")
						.addClass(_map.hasLayer(_fg$DollarGenerals) ? "" : "inactive")
						.append(
							$("<button>")
								.html("Dollar Generals: "+results.length)
								.click(button_click)
						)
				);
				loadFeatureGroup(
					_fg$DollarGenerals, 
					results, 
					{radius: 7, color: "black", fillColor: "yellow", fillOpacity: 1}
				);
				finish();
			}
		);
		
		new QueryManager(SERVICE_URL_WHOLEFOODS).getRecords(
			STATE,
			function(results){
				$("#info ul").append(
					$("<li>")
						.addClass("whole-foods")
						.addClass(_map.hasLayer(_fg$WholeFoods) ? "" : "inactive")
						.append(
							$("<button>")
								.html("Whole Foods: "+results.length)
								.click(button_click)
						)
				);
				loadFeatureGroup(
					_fg$WholeFoods, 
					results, 
					{radius: 9, color: "black", fillColor: "red", fillOpacity: 1}
				);
				finish();
			}
		);
		
		function button_click(event)
		{
			$(event.target).parent().toggleClass("inactive");
			var fg;
			if ($(event.target).parent().hasClass("starbucks")) {
				fg = _fg$Starbucks;
			} else if ($(event.target).parent().hasClass("dollar-general")) {
				fg = _fg$DollarGenerals;
			} else if ($(event.target).parent().hasClass("walmart")) {
				fg = _fg$Walmarts;
			} else {
				fg = _fg$WholeFoods;
			}
			if ($(event.target).parent().hasClass("inactive")) {
				_map.removeLayer(fg);
			} else {
				_map.addLayer(fg);
				finish();
			}
		}
		
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
		var top = $("#info").position().top + $("#info").outerHeight();
		var right = 0;
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