function QueryManager(URL)
{
	this._URL = URL;
	return this;
}

QueryManager.prototype.getCount = function(state, callBack)
{
    
    var where = "STATE = '"+state+"'"/*+" AND "+"CONAME like '%dollar%'"*/;
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

	var self = this;	
	var results = [];
	
	this.getCount(
		state,
		function(count) {

			var where = "STATE = '"+state+"'";
			console.log(count);
			
			function processData(data)
			{
				console.log("Records returned: "+data.features.length);
				results = results.concat(
					$.map(
						data.features, 
						function(value){return new Record(value.attributes);}
					)
				);
				console.log(results.length, count);
				console.log(results.length === count);
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