(function () {

	"use strict";

	//var WIDTH_THRESHOLD = 768;

	var GLOBAL_CLASS_USETOUCH = "touch";
	
	var SERVICE_URL_STARBUCKS = "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/infogroup012020_starbucks/FeatureServer/0";
	var SERVICE_URL_WALMART = "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/infogroup012020_walmart/FeatureServer/0";
	var SERVICE_URL_DOLLARGENERAL = "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/infogroup012020_dollargeneral/FeatureServer/0";
	var SERVICE_URL_WHOLEFOODS = "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/infogroup012020_wholefoods/FeatureServer/0";
	var SERVICE_URL_MCDONALDS = "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/infogroup012020_mcdonalds/FeatureServer/0";
	
	var CLASS_STARBUCKS = "starbucks";
	var CLASS_DOLLAR_GENERAL = "dollar-general";
	var CLASS_WALMART = "walmart";
	var CLASS_MCDONALDS = "mcdonalds";
	var CLASS_WHOLE_FOODS = "whole-foods";
	
	var _map;
	var _states;
	
	var _fg$Starbucks;
	var _fg$DollarGenerals;
	var _fg$Walmarts;
	var _fg$WholeFoods;
	var _fg$McDonalds;
	
	var _fg$Counties;
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

		_map.createPane("transportation");
		_map.getPane("transportation").style.zIndex = 260;

		_map.createPane("mask");
		_map.getPane("mask").style.zIndex = 300;
		_map.getPane("mask").style.pointerEvents = "none";
		
		_map.createPane("counties");
		_map.getPane("counties").style.zIndex = 250;
		
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
			{url: "http://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer",
			pane: "transportation"}
		)
		.addTo(_map);			

		_fg$Counties = L.geoJSON(
			[],
			{
				pane: "counties", 
				style: function(feature) {
					return {
						fillOpacity: 0.7, 
						stroke: true, 
						color: "white", 
						weight: 1
					};					
				},
				onEachFeature: function(feature, layer) {
					layer.bindTooltip(feature.properties.NAME+" County: "+feature.properties.POPULATION.toLocaleString());
				}
			}
		);
		
		_fg$States = L.geoJSON(
			[],
			{pane: "mask", style: {fillColor: "black", fillOpacity: 0.8, stroke: false}}
		).addTo(_map);

		_fg$DollarGenerals = L.retailMarkerGroup(
			[],
			L.icon({
				iconUrl: "resources/icon-dollar-gen.png", 
				iconSize: [20, 20],
				iconAnchor: [10, 10]
			}),
			"dgs"
		).addTo(_map).on("click", onMarkerClick);
		_fg$Starbucks = L.retailMarkerGroup(
			[],
			L.icon({
				iconUrl: "resources/icon-starbucks.png", 
				iconSize: [20, 20],
				iconAnchor: [10, 10]
			}),
			"starbucks"
		).on("click", onMarkerClick);
		_fg$McDonalds = L.retailMarkerGroup(
			[],
			L.icon({
				iconUrl: "resources/icon-mcds.png", 
				iconSize: [22, 22],
				iconAnchor: [11, 11]
			}),
			"mcdonalds"			
		).on("click", onMarkerClick);
		_fg$Walmarts = L.retailMarkerGroup(
			[],
			L.icon({
				iconUrl: "resources/icon-walmart.png", 
				iconSize: [34, 34],
				iconAnchor: [17, 17]
			}),
			"walmart"
		).addTo(_map).on("click", onMarkerClick);
		_fg$WholeFoods = L.retailMarkerGroup(
			[],
			L.icon({
				iconUrl: "resources/icon-whole-foods.png", 
				iconSize: [34, 34],
				iconAnchor: [17, 17]
			}),
			"wholefoods"			
		).on("click", onMarkerClick);
		
		var lut = {};
		lut[CLASS_STARBUCKS] = _fg$Starbucks;
		lut[CLASS_WALMART] = _fg$Walmarts;
		lut[CLASS_MCDONALDS] = _fg$McDonalds;
		lut[CLASS_WHOLE_FOODS] = _fg$WholeFoods;
		lut[CLASS_DOLLAR_GENERAL] = _fg$DollarGenerals;
		
		$.each(
			lut,
			function(className, layer)
			{
				$("#info ul").append(
					$("<li>")
						.addClass(className)
						.addClass(_map.hasLayer(layer) ? "" : "inactive")
						.append(
							$("<button>")
								.append($("<span>"))
								.append($("<span>"))
								.click(button_click)
						)
				);
			}
		);

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
				
				$("#info input").change(onCheckChange);
				
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

	function onCheckChange(e)
	{
		if ($("input").get(0).checked) {
			_map.addLayer(_fg$Counties);
		} else {
			_map.removeLayer(_fg$Counties);
		}
	}
	
	function button_click(event)
	{
		$(event.target).parent().toggleClass("inactive");
		var fg;
		if ($(event.target).parent().hasClass(CLASS_STARBUCKS)) {
			fg = _fg$Starbucks;
		} else if ($(event.target).parent().hasClass(CLASS_DOLLAR_GENERAL)) {
			fg = _fg$DollarGenerals;
		} else if ($(event.target).parent().hasClass(CLASS_WALMART)) {
			fg = _fg$Walmarts;
		} else if ($(event.target).parent().hasClass(CLASS_MCDONALDS)) {
			fg = _fg$McDonalds;
		} else if ($(event.target).parent().hasClass(CLASS_WHOLE_FOODS)){
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

		$("#info ul li button span:nth-of-type(2)").html("---");
		
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
		_map.fitBounds(L.latLngBounds(_fullExtent).pad(-0.1));	

		_fg$Counties.clearLayers();
		L.esri.query({
			url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Counties_Generalized/FeatureServer/0"
		})
			.where("STATE_FIPS = '"+state.getFipsCode()+"'")
			.run(
				function(error, featureCollection, response) {
					_fg$Counties.addData(featureCollection);
					var values = $.map(
						featureCollection.features, 
						function(feature){return feature.properties.POPULATION;}
					).sort(function(a,b){return a-b;});
					var increment = Math.floor(values.length / 5);
					_fg$Counties.setStyle(
						function(feature) {
							return {fillColor: getColor(feature.properties.POPULATION)};
							function getColor(population)
							{
								return population <= values[increment] ? "#F5F500" :
										population <= values[increment*2] ? "#F5B800" :
										population <= values[increment*3] ? "#F57A00" :
										population <= values[increment*4] ? "#F53D00" :
																			"#F50000";
							}
						}
					);
				}
			);

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
				$("#info ul li."+CLASS_STARBUCKS+" button span:nth-of-type(2)").html(results.length);
				_fg$Starbucks.addIcons(results);
			}
		);
		
		new QueryManager(SERVICE_URL_MCDONALDS).getRecords(
			STATE,
			function(results) {
				$("#info ul li."+CLASS_MCDONALDS+" button span:nth-of-type(2)").html(results.length);
				_fg$McDonalds.addIcons(results);
			}
		);
		
		new QueryManager(SERVICE_URL_WALMART).getRecords(
			STATE,
			function(results){
				$("#info ul li."+CLASS_WALMART+" button span:nth-of-type(2)").html(results.length);
				_fg$Walmarts.addIcons(results);
			}
		);
		
		new QueryManager(SERVICE_URL_DOLLARGENERAL).getRecords(
			STATE,
			function(results){
				$("#info ul li."+CLASS_DOLLAR_GENERAL+" button span:nth-of-type(2)").html(results.length);
				_fg$DollarGenerals.addIcons(results);
			}
		);
		
		new QueryManager(SERVICE_URL_WHOLEFOODS).getRecords(
			STATE,
			function(results){
				$("#info ul li."+CLASS_WHOLE_FOODS+" button span:nth-of-type(2)").html(results.length);
				_fg$WholeFoods.addIcons(results);
			}
		);
				
	}

	/***************************************************************************
	******************************** FUNCTIONS *********************************
	***************************************************************************/
	
	function getExtentPadding()
	{
		var landscape = ($(window).width() / $(window).height()) >= 1;
		var top = landscape ? 0 : $("#info").outerHeight();
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