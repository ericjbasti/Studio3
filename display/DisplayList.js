Studio.DisplayList = function(attr){
	this.cache = null;
	this.ctx = null;
	this.cached = false;
	this.first 	= null;
	this.last	= null;
	this.length = 0;
	this.marked = [];
	this.autoCache = true;
	if (attr){
		this.apply(attr); 
	}
}


Studio.DisplayList.prototype = new Studio.DisplayObject();
Studio.DisplayList.prototype.constructor = Studio.DisplayList;


Studio.DisplayList.prototype.cacheAsBitmap = function(who){
	this.cache = document.createElement('canvas');
	this.cache.height = this.height * who.resolution || 400;
	this.cache.width = this.width * who.resolution  || 320;
	this.ctx = this.cache.getContext('2d');
	this.ctx.scale(who.resolution,who.resolution);
	// document.body.appendChild(this.cache);
}

Studio.DisplayList.prototype.updateCache = function(){
	this.cached = false;
	this.ctx.clearRect(0,0,this.width, this.height);
	this.render(this);
	this.cached = true;
}
Studio.DisplayList.prototype._cacheIt = function(){
	this.ctx.clearRect(0,0,this.width, this.height);
	this.render(this);
}
Studio.DisplayList.prototype.updateElement = function(who){
	who.render(this);
}

Studio.DisplayList.prototype.clearCachedElement = function(who){
	this.ctx.clearRect(who._x-who.width/2,who._y-who.height/2,who.width, who.height);
}

Studio.DisplayList.prototype.markedForRemoval = function(who){
	this.marked[this.marked.length] = who;
	// this.marked.length++;
}

Studio.DisplayList.prototype.removeMarked = function(){
	for (var i = 0; i!= this.marked.length;i++){
		if(this.marked[i]){
			this.clearCachedElement(this.marked[i]);
		}
		this.marked[i]=null;
	}
	this.marked.lengh=0;
}

Studio.DisplayList.prototype.deactivateCache = function(){
	this.cached = false;
}

Studio.DisplayList.prototype.update = function(e){
	if(this.marked.length){
		this.removeMarked();
	}
	//if(this.cache){
		this.update_visibility();
		this.update_scale();
		this.update_dimensions();
		this.update_xy();
		this.update_speed();
	//}
	var listItem = this.first;
	while(listItem){
		this.next = listItem.next;
		listItem.update();
		listItem = listItem.next || this.next;
	}
	if(!this.cached && this.autoCache && this.ctx){
		this.updateCache();
	}
}

Studio.DisplayList.prototype.render = function(e){
	if(this.cached){
		if(this._alpha!==e.ctx.globalAlpha){
			e.ctx.globalAlpha=this._alpha;
		}
		this.draw(e.ctx);
	}else{
		
		var listItem = this.first;
		while(listItem){
			this.next = listItem.next;
			listItem.render(e);
			listItem = listItem.next || this.next;
		}
	}
}
Studio.DisplayList.prototype.add = function(who){
	who.parent = this;

	this.length++; // add to our length so we can easily tell how big our list is.
	if (this.length <= 1 && this.first === null && this.last === null){
		this.first = who;
		this.last = who;
		who.prev = null;
		this.length = 1
		return who;
	}
	this.last.next = who; // we add the new item to the previously last item.
	who.prev = this.last; // we mark the new items previous to be the last item in the list.
	this.last = who; // we have a new last item now.
	return who;
}

Studio.DisplayList.prototype.draw = function(ctx){
	ctx.drawImage(this.cache,0,0,this.cache.width,this.cache.height,this._x,this._y,this._width,this._height);
};


Studio.addTo(Studio.DisplayList.prototype,LinkedList.prototype);

