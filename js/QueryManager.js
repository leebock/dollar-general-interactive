function QueryManager(URL)
{
	this._URL = URL;
	return this;
}

QueryManager.prototype._getCount = function(where, callBack)
{

    var request = this._URL+"/query"+
                "?where="+encodeURIComponent(where)+
				"&outFields=*"+
                "&returnCountOnly=true"+
                "&f=pjson";

    $.getJSON(
        request, 
        function(data) {
			callBack(data.count); 
        }
    );		
    
};

QueryManager.prototype._getRecords = function(where, callBack)
{

	var self = this;	
	var results = [];
	
	this._getCount(
		where,
		function(count) {
			
			function processData(data)
			{
				results = results.concat(
					$.map(
						data.features, 
						function(value){return new Record(value.attributes);}
					)
				);
				if (results.length === count) {
					callBack(results);
				}
			}
			
			for (var i=0; i < Math.ceil(count/2000); i++) {
				var request = self._URL+"/query"+
			                "?where="+encodeURIComponent(where)+
							"&resultOffset="+(i*2000)+
							"&resultRecordCount=2000"+
			                "&outFields=*"+
			                "&f=pjson";
				$.getJSON(request, processData);		
			}
			
		}
	);
        
};

QueryManager.prototype.getStarbucks = function(state, callBack)
{
	this._getRecords(
		"STATE = '"+state+"' AND CONAME like '%starbucks%'",
		callBack
	);
};

QueryManager.prototype.getWalmarts = function(state, callBack)
{
	this._getRecords(
		"STATE = '"+state+"' AND CONAME like '%walmart%'",
		callBack
	);
};

QueryManager.prototype.getDollarGenerals = function(state, callBack)
{
	this._getRecords(
		"STATE = '"+state+"' AND CONAME like '%dollar%'",
		callBack
	);
};

QueryManager.prototype.getWholeFoods = function(state, callBack)
{
	this._getRecords(
		"STATE = '"+state+"' AND CONAME like '%whole%'",
		callBack
	);
};