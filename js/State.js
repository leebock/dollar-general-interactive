function State(json)
{
	this._json = json;
}

State.prototype.getName = function()
{
	return this._json.NAME;
};

State.prototype.getAbbreviation = function()
{
	return this._json.STUSPS;
};

State.prototype.getFipsCode = function()
{
	return this._json.STATEFP;
};

State.prototype.getBounds = function()
{
	return [[this._json.ymin, this._json.xmin],[this._json.ymax, this._json.xmax]];
};