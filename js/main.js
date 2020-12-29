(function () {

	"use strict";

	//var WIDTH_THRESHOLD = 768;

	var GLOBAL_CLASS_USETOUCH = "touch";

	/* note: name property below serves as layer pane name, general identifier, 
		and css class */
	
	var _master = [
		{
			name: "walmart", 
			url: "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/infogroup012020_walmart/FeatureServer/0", 
			icon: {
				iconUrl: "resources/icon-walmart.png", 
				iconSize: [22, 22],
				iconAnchor: [11, 11]
			}
		},
		{
			name: "mcdonalds", 
			url: "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/infogroup012020_mcdonalds/FeatureServer/0", 
			icon: {
				iconUrl: "resources/icon-mcds.png", 
				iconSize: [16, 16],
				iconAnchor: [8, 8]
			}
		},
		{
			name: "starbucks", 
			url: "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/infogroup012020_starbucks/FeatureServer/0", 
			icon: {
				iconUrl: "resources/icon-starbucks.png", 
				iconSize: [16, 16],
				iconAnchor: [8, 8]
			}
		},
		{
			name: "dollar-general", 
			url: "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/infogroup012020_dollargeneral/FeatureServer/0", 
			icon: {
				iconUrl: "resources/icon-dollar-gen.png", 
				iconSize: [16, 16],
				iconAnchor: [8, 8]
			}
		},
		{
			name: "whole-foods", 
			url: "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/infogroup012020_wholefoods/FeatureServer/0", 
			icon: {
				iconUrl: "resources/icon-whole-foods.png", 
				iconSize: [22, 22],
				iconAnchor: [11, 11]
			}
		}
	];
	
	var _map;
	var _states;

	var _fg$Counties;
	var _fg$States;
	
	var _buttonList;
	
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
			.addLayer(L.esri.basemapLayer("Gray"))
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
		
		// create the layer for each item in master (I delayed this until dom loaded...)
		
		$.each(
			_master, 
			function(index, item) {
				_map.createPane(item.name);
				_map.getPane(item.name).style.zIndex = 619+index;
				item.layer = L.retailMarkerGroup([], L.icon(item.icon), item.name)
					.on("click", onMarkerClick);
				if (index === 0 || index === 3) {
					item.layer.addTo(_map);
				}
			}
		);
				
		_map.createPane("transportation");
		_map.getPane("transportation").style.zIndex = 260;

		_map.createPane("mask");
		_map.getPane("mask").style.zIndex = 300;
		_map.getPane("mask").style.pointerEvents = "none";
		
		_map.createPane("counties");
		_map.getPane("counties").style.zIndex = 250;
		
		setTimeout(
			function() {
				$(".leaflet-esri-labels-pane").css("z-index", 640);
			},
			2000
		);
		
		L.esri.tiledMapLayer(
			{url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer",
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
					layer.bindTooltip(
						feature.properties.NAME+" County: "+
						feature.properties.POP_SQMI.toLocaleString()+
						" persons / sq. mile");
				}
			}
		);
		
		_fg$States = L.geoJSON(
			[],
			{pane: "mask", style: {fillColor: "gray", fillOpacity: 0.8, stroke: false}}
		).addTo(_map);
		
		_buttonList = $(new ButtonList(
			$("ul#buttonlist").get(0), 
			_master.reduce(
				function(o, val) {o[val.name] = _map.hasLayer(val.layer);return o;},
				{}
			)
		))
		.on("layerToggle", onLayerToggle)
		.get(0);
		
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
	
	function onLayerToggle(event, className, visibility)
	{
		
		var fg = $.grep(
			_master, 
			function(value, index){return value.name === className;}
		).shift().layer;
		
		if (visibility) {
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

		_buttonList.clearValues();
		
		$.each(
			$.map(_master, function(value){return value.layer;}), 
			function(idx, fg){fg.clearLayers();}
		);
		
		var state = $.grep(
			_states, 
			function(value) {
				return value.getAbbreviation() === STATE;
			}
		).shift(); 
		
		// frame the state
		_fullExtent = state.getBounds();
		_map.fitBounds(L.latLngBounds(_fullExtent));	

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
						function(feature){return feature.properties.POP_SQMI;}
					).sort(function(a,b){return a-b;});
					var increment = Math.floor(values.length / 5);
					_fg$Counties.setStyle(
						function(feature) {
							return {fillColor: getColor(feature.properties.POP_SQMI)};
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
		
		$.each(
			_master, 
			function(index, value) {
				new QueryManager(value.url).getRecords(
					STATE, 
					function(results){
						_buttonList.setValue(value.name, results.length);
						value.layer.addIcons(results);
					}
				);
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