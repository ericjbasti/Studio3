Studio.load = function(path, type, callback){
	
	var request = new XMLHttpRequest();

	request.onload = function() {
		var data = null;
		if ((request.status >= 200 && request.status < 400) || request.status == 0) {
			console.log('%cStudio loaded file : '+path, Studio.statStyle);
			
			if(type.toLowerCase() == "json"){
				data = JSON.parse(request.responseText);
			}
			if(callback){
				callback(data)
			}
		} else {
			this.onerror();
		}
	};

	request.onerror = function() {
		console.log('%cStudio failed to load file : '+path, Studio.errorStyle);
	};
	request.open('GET', path, true);
	request.send();
}







Studio.TileMap = function(data, set){
	this.cache = new Studio.Cache(30*32,16*32,1);
}

Studio.TileMap.prototype = {
	constructor: Studio.TileMap,
	build: function(data,set,sx,sy,mx,my){
		var map = data;
		var buffer = this.cache.ctx;
		var width = set.tileWidth;
		var height = set.tileHeight;
		var sx = sx || 0;
		var sy = sy || 0;
		var mX = mx || map.width-sx;
		var mY = my || map.height-sy;
		for(var y = 0; y !=mY; y++ ){
			for(var x = 0; x!= mX; x++){
				var i = (map.data[((y+sy)*map.width)+(x+sx)]) - set.firstgid;
				var _y = i/set.across | 0 ;
				var _x = i - (_y * set.across);
				buffer.drawImage(set.set.image, _x*set.tileWidth, _y*set.tileHeight, set.tileWidth, set.tileHeight, x*set.tileWidth, y*set.tileHeight, set.tileWidth, set.tileHeight)
			}
		}
		this.cache.ready = true;
	},
	onMapLoad : function(data){
		var set = data.tilesets[0];
		var setimage = new Studio.Image('assets/'+set.image);
		var tileset =  new Studio.TileSet( setimage, set.tilewidth, set.tileheight, set.imagewidth);
		var test = function test(result){
			if (!result) {
				console.log("The image isn't ready so we need to wait.");
				return;
			}
			if(result == true){
				// map  = new Studio.TileMap();
				console.log( 'The Image is ready, we can now create the tileset from the information provided, and then build the map from the data layer.' );
				for(var i in data.layers){
					map.build( data.layers[i], tileset);
				}
			}
		}
		// change to addListenerFunction( function ) ... this explains what the variable needs to be.
		setimage.status.addListener(test);
	},
	load : function(asset, type){
		Studio.load(asset, type, this.onMapLoad)
	}
};






Studio.TileSet = function( image, width, height, imagewidth){
	this.firstgid = 1;
	this.tileWidth = width || 32;
	this.tileHeight = height || 32;
	this.across = imagewidth/width | 0;
	this.set = image || null;
}

Studio.TileSet.prototype = {
	constructor: Studio.TileSet,
	onLoadComplete: function(data){
		data.across = data.set.width/data.tileWidth;
	}
};