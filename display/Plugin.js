Studio.Plugin = function(attr) {
	this.init = null;
	this.options = {};
	this.action = null;

	this.apply(attr);
}

Studio.Plugin.constructor = Studio.Plugin;

Studio.Plugin.prototype.apply = Studio.apply;

Studio.Plugin.prototype._options = function(a) {
	for (var i in a) {
		this.options[i] = a[i];
	}
}