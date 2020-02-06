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
	var _fg$States;
	
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
				zoomControl: false, 
				attributionControl: false, 
				maxZoom: 19, minZoom: 2, 
				worldCopyJump: true
			},
			getExtentPadding			
		)			
			.addLayer(L.esri.basemapLayer("DarkGray"))
			.addLayer(L.esri.basemapLayer("ImageryLabels"))
			.addControl(L.control.attribution({position: 'bottomleft'}))
			.on("moveend", onExtentChange);

		if (!L.Browser.mobile) {
			_map.addControl(L.control.zoom({position: "bottomright"}));
			L.easyButton({
				states:[
					{
						icon: "fa fa-home",
						onClick: function(btn, map){
							_map.fitBounds(_fullExtent);
						},
						title: "Full extent"
					}
				],
				position: "bottomright"
			}).addTo(_map);			
		}

		_map.createPane("mask");
		_map.getPane("mask").style.zIndex = 300;
		_map.getPane("mask").style.pointerEvents = "none";
		
		_map.createPane("wholefoods");
		_map.getPane("wholefoods").style.zIndex = 623;
		
		_map.createPane("dgs");
		_map.getPane("dgs").style.zIndex = 622;
		
		_map.createPane("starbucks");
		_map.getPane("starbucks").style.zIndex = 621;
		
		_map.createPane("mcdonalds");
		_map.getPane("mcdonalds").style.zIndex = 620;
		
		_map.createPane("walmart");
		_map.getPane("walmart").style.zIndex = 619;
		
		setTimeout(
			function() {
				$(".leaflet-esri-labels-pane").css("z-index", 640);
			},
			2000
		);
		
		L.esri.tiledMapLayer(
			{url: "http://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer"}
		)
		.addTo(_map);			

		
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
		
		_fg$States = L.geoJSON(
			[],
			{pane: "mask", style: {fillColor: "black", fillOpacity: 0.8, stroke: false}}
		).addTo(_map);

		_fg$DollarGenerals = L.featureGroup().addTo(_map).on("click", onMarkerClick);
		_fg$Starbucks = L.featureGroup().on("click", onMarkerClick);
		_fg$McDonalds = L.featureGroup().on("click", onMarkerClick);
		_fg$Walmarts = L.featureGroup().addTo(_map).on("click", onMarkerClick);
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

		_fg$States.clearLayers();
		L.esri.query({
			url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_States_Generalized/FeatureServer/0"
		})
			.where("STATE_FIPS <> '"+state.getFipsCode()+"'")
			.run(
				function(error, featureCollection, response) {
					_fg$States.addData(featureCollection);
				}
			);

		
		new QueryManager(SERVICE_URL_STARBUCKS).getRecords(
			STATE, 
			function(results){
				$("#info ul").append(
					$("<li>")
						.addClass("starbucks")
						.addClass(_map.hasLayer(_fg$Starbucks) ? "" : "inactive")
						.append(
							$("<button>")
								.html("Starbucks<br>"+results.length)
								.click(button_click)
						)
				);
				loadFeatureGroup(
					_fg$Starbucks, 
					results, 						
					function(latLng) {
						return L.marker(
							latLng, 
							{
								icon: 
								L.icon({
									iconUrl: "resources/icon-starbucks.png", 
									iconSize: [20, 20],
									iconAnchor: [10, 10]
								}),
								pane: "starbucks"
							}
						);
					} 
				);
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
								.html("McDonalds<br>"+results.length)
								.click(button_click)
						)
				);
				loadFeatureGroup(
					_fg$McDonalds, 
					results, 						
					function(latLng) {
						return L.marker(
							latLng, 
							{
								icon: 
								L.icon({
									iconUrl: "resources/icon-mcds.png", 
									iconSize: [22, 22],
									iconAnchor: [11, 11]
								}),
								pane: "mcdonalds"
							}
						);
					} 
				);
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
								.html("Walmarts<br>"+results.length)
								.click(button_click)
						)
				);
				loadFeatureGroup(
					_fg$Walmarts,
					results,
					function(latLng) {
						return L.marker(
							latLng, 
							{
								icon: 
								L.icon({
									iconUrl: "resources/icon-walmart.png", 
									iconSize: [34, 34],
									iconAnchor: [17, 17]
								}),
								pane: "walmart"
							}
						);
					} 					
				);
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
								.html("Dollar Generals<br>"+results.length)
								.click(button_click)
						)
				);
				loadFeatureGroup(
					_fg$DollarGenerals, 
					results, 
					function(latLng) {
						return L.marker(
							latLng, 
							{
								icon: 
								L.icon({
									iconUrl: "resources/icon-dollar-gen.png", 
									iconSize: [20, 20],
									iconAnchor: [10, 10]
								}),
								pane: "dgs"
							}
						);
					} 
				);
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
								.html("Whole Foods<br>"+results.length)
								.click(button_click)
						)
				);
				loadFeatureGroup(
					_fg$WholeFoods, 
					results,
					function(latLng) {
						return L.marker(
							latLng, 
							{
								icon: 
								L.icon({
									iconUrl: "resources/icon-whole-foods.png", 
									iconSize: [34, 34],
									iconAnchor: [17, 17]
								}),
								pane: "wholefoods"
							}
						);
					} 										
				);
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
			}
		}
		
		function loadFeatureGroup(featureGroup, records, markerCreator)
		{
			$.each(
				records, 
				function(index, record) {
					markerCreator(record.getLatLng())
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
		
	}

	/***************************************************************************
	******************************** FUNCTIONS *********************************
	***************************************************************************/
	
	function getExtentPadding()
	{
		var landscape = ($(window).width() / $(window).height()) >= 1;
		/*

		var top = landscape ? 
					0 : 
					!$("#blurb").hasClass("hidden") ? $("#blurb").outerHeight() : 0;
		var right = landscape ? 
						!$("#blurb").hasClass("hidden") ? 
							$(window).width() - $("#blurb").position().left : 
							0 :
						0;
		*/
		var top = landscape ? 0 : 250;
		var right = 0;
		var bottom = 0;
		var left = landscape ? $("#info").outerWidth()+10 : 0;
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