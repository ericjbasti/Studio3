if (!window.Ejecta) {// if not running through EJECTA we need to build out a couple items
	var iAd = new Studio.Image('ad.png');
	var Ejecta = {
		AdBanner: function() {
			this.ad = new Studio.Sprite({height: 50, width: 320, image: iAd, anchorX: 0, anchorY: 1, y: 0});
			this.isAtBottom = false;
			this.onload = function() {};
			this.onerror = function() {};
			this.show = function() {
				//Game.camera.y=-50;
			};
			this.hide = function() {
				//Game.camera.y=0;
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

ejecta.include('requirements.js');
ejecta.include('studio.js');
ejecta.include("display/displayObject.js");
ejecta.include("display/LinkedList.js");
ejecta.include("display/DisplayList.js");
ejecta.include("display/Plugin.js");
ejecta.include("display/rect.js");
ejecta.include("display/circle.js");
ejecta.include("display/image.js");
ejecta.include("display/sprite.js");
ejecta.include("display/camera.js");
ejecta.include("display/scene.js");
ejecta.include("display/stage.js");
ejecta.include("engines/webgl.js");
ejecta.include("engines/canvas.js");
ejecta.include("display/tween.js");
ejecta.include("display/font.js");
ejecta.include("display/textbox.js");
ejecta.include("input/keyboard.js");
ejecta.include("input/touch.js");

