(function () {

	"use strict";

	//var WIDTH_THRESHOLD = 768;

	var GLOBAL_CLASS_USETOUCH = "touch";
	
	var SERVICE_URL_STARBUCKS = "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/infogroup012020_starbucks/FeatureServer/0";
	var SERVICE_URL_WALMART = "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/infogroup012020_walmart/FeatureServer/0";
	var SERVICE_URL_DOLLARGENERAL = "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/infogroup012020_dollargeneral/FeatureServer/0";
	var SERVICE_URL_WHOLEFOODS = "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/infogroup012020_wholefoods/FeatureServer/0";
	var SERVICE_URL_MCDONALDS = "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/infogroup012020_mcdonalds/FeatureServer/0";
	
	var _map;
	var _states;
	
	var _fg$Starbucks;
	var _fg$DollarGenerals;
	var _fg$Walmarts;
	var _fg$WholeFoods;
	var _fg$McDonalds;
	
	//var _fl$ElectionResults;
	
	var BNDS_LOWER48 = [[24.743, -124.784], [49.345, -66.951]];
	
	var _fullExtent = BNDS_LOWER48;

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
				maxZoom: 19, minZoom: 2, 
				worldCopyJump: true
			},
			getExtentPadding			
		)			
			.addLayer(L.esri.basemapLayer("ImageryFirefly"))			
			.addLayer(L.esri.basemapLayer("ImageryLabels"))
			.addControl(L.control.attribution({position: 'bottomleft'}))
			.on("moveend", onExtentChange);

		if (!L.Browser.mobile) {
			L.easyButton({
				states:[
					{
						icon: "fa fa-home",
						onClick: function(btn, map){
							_map.fitBounds(_fullExtent);
						},
						title: "Full extent"
					}
				]
			}).addTo(_map);			
		}

		_map.createPane("test");
		_map.getPane('test').style.zIndex = 399;
		_map.getPane('test').style.pointerEvents = 'none';
		_map.getPane('test').style.display = 'none';
		
		/*
		_fl$ElectionResults = L.esri.featureLayer(
			{
				url: "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/2016_Presidential_Results_by_County/FeatureServer/0",
				where: "1 <> 1",
				style: function(feature) {
					return {
						color: "white", 
						fillColor: feature.properties.Winner === "Clinton" ? "blue" : "red",
						fillOpacity: 0.8
					};
				},
				pane: "test",
				onEachFeature: function(feature, layer) {
					layer.bindTooltip(feature.properties.NAME+" County");
				}
			}
		)
		.addTo(_map);
		*/

		_fg$DollarGenerals = L.featureGroup().addTo(_map).on("click", onMarkerClick);
		_fg$Starbucks = L.featureGroup().addTo(_map).on("click", onMarkerClick);
		_fg$McDonalds = L.featureGroup().addTo(_map).on("click", onMarkerClick);
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
		_fg$McDonalds.clearLayers();
		
		var state = $.grep(
			_states, 
			function(value) {
				return value.getAbbreviation() === STATE;
			}
		).shift(); 
		
		// frame the state
		_fullExtent = state.getBounds();
		_map.fitBounds(_fullExtent);	
		/*
		_fl$ElectionResults.setWhere(
			"STATE_FIPS = '"+state.getFipsCode()+"'",
			function() {
				$("#info ul").append(
					$("<li>")
						.addClass("election")
						.addClass($(".leaflet-test-pane").css("display") === "none" ? "inactive" : "")
						.append(
							$("<button>")
								.html("2016 Election")
								.click(
									function(event) {
										$(".leaflet-test-pane").toggle();
										$(event.target).parent().toggleClass("inactive");										
									}
								)
						)
				);
			}
		);
		*/
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
		
		new QueryManager(SERVICE_URL_MCDONALDS).getRecords(
			STATE,
			function(results) {
				$("#info ul").append(
					$("<li>")
						.addClass("mcdonalds")
						.addClass(_map.hasLayer(_fg$McDonalds) ? "" : "inactive")
						.append(
							$("<button>")
								.html("McDonalds: "+results.length)
								.click(button_click)
						)
				);
				loadFeatureGroup(
					_fg$McDonalds, 
					results, 						
					{radius: 7, color: "white", fillColor: "red", fillOpacity: 1}
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
					{radius: 9, color: "black", fillColor: "purple", fillOpacity: 1}
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
			} else if ($(event.target).parent().hasClass("mcdonalds")) {
				fg = _fg$McDonalds;
			} else if ($(event.target).parent().hasClass("whole-foods")){
				fg = _fg$WholeFoods;
			} else {
				// nothing
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
						.bindPopup(
							record.getName()+"<br>"+
							record.getAddress()+"<br>"+
							record.getCity()+", "+record.getState(), 
							{closeButton: false}
						)
						.bindTooltip(
							record.getCity()+", "+record.getState()							
						)
						.addTo(featureGroup);

				}
			);	
		}
		
		function finish()
		{
			_fg$DollarGenerals.bringToBack();
			_fg$McDonalds.bringToFront();
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