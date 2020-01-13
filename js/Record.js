function Record(json)
{
	this._json = json;
}

Record.prototype.getName = function()
{
	return this._json.CONAME;
};

Record.prototype.getAddress = function()
{
	return this._json.ADDR;
};

Record.prototype.getCity = function()
{
	return this._json.CITY;
};

Record.prototype.getState = function()
{
	return this._json.STATE;
};

Record.prototype.getZip = function()
{
	return this._json.ZIP;
};

Record.prototype.getLatLng = function()
{
	return L.latLng(this._json.LATITUDE, this._json.LONGITUDE);
};