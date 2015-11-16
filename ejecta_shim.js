if (!window.Ejecta) {// if not running through EJECTA we need to build out a couple items
	var Ejecta = {
		AdBanner: function() {
			this.isAtBottom = false;
			this.onload = function() {};
			this.onerror = function() {};
			this.show = function() {
				
			};
			this.hide = function() {
				
			};
		},
	};
	
	var ejecta = {
		__included: {},
		include: function(src) {
			if (this.__included[src]) return;
			this.__included[src] = true;
			
			var js = document.createElement("script");

			js.type = "text/javascript";
			js.src = src;

			document.body.appendChild(js);
		},
		getText: function(title, message, callback) {
			callback(window.prompt(message));
		}
	};
}