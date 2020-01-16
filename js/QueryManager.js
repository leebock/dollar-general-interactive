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

QueryManager.prototype.getRecords = function(state, callBack)
{
	
	var where = "STATE = '"+state+"'";

	var self = this;	
	var results = [];
	
	this._getCount(
		where,
		function(count) {
			
			if (count === 0) {
				callBack(results);
			} else {
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
						
		}
	);
        
};