Studio.Stage.prototype.update_tweens = function(){
	var i,j = 0;
	var tween,key, delta;
	for (i in this.tweens){
		tween = this.tweens[i];
		tween.cur+=((Studio.delta)*tween.actor._speed);
		if(!tween.dir) {
			delta = tween.cur/tween.duration;
		}else{
			delta = 1 - tween.cur/tween.duration;
		}
		if(delta<1 && delta>0){
			for(j=0;j!==tween.keys.length;j++){
				key = tween.keys[j];
				this.update_property(tween,key, delta);
			}
		}else{
			if(tween._loop) {
				tween.cur=0;
				if(tween._reflect){
					if(!tween.dir){
						tween.dir=1;
					}else{
						tween.dir=0;
					}
				}
				return;
			}else{
				if(tween.reset){
					tween.actor.apply(tween.original);
				}else{
					tween.actor.apply(tween.to);
					// for(j=0;j!==tween.keys.length;j++){
					// 	key = tween.keys[j];
					// 	tween.actor[key] = tween.to[key];
					// }
				}
				if(tween.callback){
					tween.callback.call(tween.actor);
				}
				tween=null;
				this.tweens[i]=null;
				delete this.tweens[i];
			}
		}
	}
};

Studio.Stage.prototype.update_property = function(tween,key,delta){
	tween.actor[key] = tween.original[key] + (Studio.Ease[tween.ease](delta) * (tween.to[key]-tween.original[key]));
}


Studio._tween_object = function(who, ease, to, duration, callback){
	this.actor= who;
	this.ease= ease;
	this.original= {};
	this.to= to;
	this.cur= 0;
	this.duration= duration;
	this.callback= callback;
	this._loop= false;
	this._reflect= true;
	this.reset= false;
	this.dir= 0;
	this.id= null;
	this.keys= Object.keys(to);
}

Studio._tween_object.prototype.constructor = Studio._tween_object;

Studio._tween_object.prototype.loop= function(setting){
	this._loop = setting;
	return this;
}
Studio._tween_object.prototype.reflect= function(setting){
	this._reflect = setting;
	return this;
}
Studio._tween_object.prototype.setActor= function(actor){
	this.actor = actor;
	return this;
}



Studio.Stage.prototype.createTween = function(who, ease, to, duration, callback) {
	var temp = new Studio._tween_object(who, ease, to, duration, callback);
	temp.id = this.nextID;
	temp.apply = function(a) {
		for (var key in a) {
			this[key] = a[key];
		}
		return this;
	}

	for (var key in to) {
		temp.original[key] = who[key];
	}

	this.nextID++;
	return temp;
};


Studio.Stage.prototype.createLoop = function(who,ease,to,duration,callback){
	this.tweens[this.nextID] = this.createTween(who,ease,to,duration,callback);
	this.tweens[this.nextID-1].loop = true;
	return this.tweens[this.nextID-1];
}
Studio.Stage.prototype.addTween = function(who,ease,to,duration,callback){
	this.tweens[this.nextID] = this.createTween(who,ease,to,duration,callback);
	return this.tweens[this.nextID-1];
};


Studio.Stage.prototype.playTween = function(who) {
	who.cur = 0;
	for (var j = 0; j !== who.keys.length; j++) {
		who.original[who.keys[j]] = who.actor[who.keys[j]];
	}
	this.tweens[who.id] = who;
};

Studio.Stage.prototype.stopTween = function(who,snap,original){
	if(this.tweens[who.id]){ // lets make sure the tween is active first
		who.cur=0;
		who.dir=0;
		if(snap){
			if(original){
				for(var j=0;j!==who.keys.length;j++){
					who.actor[who.keys[j]]=who.original[who.keys[j]];
				}
			}else{
				for(var j=0;j!==who.keys.length;j++){
					who.actor[who.keys[j]]=who.to[who.keys[j]];
				}
			}
		}
		this.tweens[who.id]=null;
		delete this.tweens[who.id];
	}
};

Studio.Ease = {};

Studio.Ease.linear = function(t) {
	return t;
};

Studio.Ease.snap = function(t) {
	return Math.round(t);
};

Studio.Ease.backOut = function(t) {
	var s = 1.70158;
	return --t * t * ((s + 1) * t + s) + 1;
};

Studio.Ease.bounceOut = function(t) {
	if (t < (0.363636)) {
		return 7.5625 * t * t;
	} else if (t < 0.727272) {
		return 7.5625 * (t -= (0.545454)) * t + 0.75;
	} else if (t < 0.909090) {
		return 7.5625 * (t -= (0.818181)) * t + 0.9375;
	} else {
		return 7.5625 * (t -= (0.959595)) * t + 0.984375;
	}
};

Studio.Ease.elasticOut = function(t) {
	var s, a = 0.1, p = 0.4;
	if (t === 0) {
		return 0;
	}
	if (t === 1) {
		return 1;
	}
	if (!a || a < 1) { 
		a = 1; s = p / 4; 
	}else {
		s = p * Math.asin(1 / a) / (6.283);
	}
	return (a * Math.pow(2, -10 * t) * Math.sin((t - s) * (6.283) / p) + 1);
};

Studio.Ease.linearRandom = function(t) {
	return Math.random() * t;
};

Studio.Ease.random = function() {
	return Math.random();
};

Studio.Ease.quadIn = function(t) {
	return t * t;
};

Studio.Ease.quadOut = function(t) {
	return t * (2 - t);
};

Studio.Ease.quadInOut = function(t) {
	if ((t *= 2) < 1) {
		return 0.5 * t * t;
	}
	return -0.5 * (--t * (t - 2) - 1);
};

