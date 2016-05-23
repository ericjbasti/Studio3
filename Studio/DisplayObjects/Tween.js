Studio.Scene.prototype.update_tweens = function(global_delta) {
	var i,j = 0
	var tween, key, delta
	for (i in this.tweens) {
		tween = this.tweens[i]
		if (tween.actor._world) {
			tween.cur += global_delta * tween.actor._world.speed
		} else {
			tween.cur += global_delta
		}
		if (!tween.active && tween.onStart) {
			tween.onStart.call(tween.actor)
			tween.active = 1
		}
		if (!tween.dir) {
			delta = tween.cur / tween.duration
		} else {
			delta = 1 - tween.cur / tween.duration
		}
		if (delta < 1 && delta > 0) {
			for (j = 0; j !== tween.keys.length; j++) {
				key = tween.keys[j]
				this.update_property(tween,key, delta)
			}
		} else {
			if (tween.next) {
				tween.next._snapshot()
				tween.next.cur = tween.cur - tween.duration
				this.tweens[i] = tween.next

				// return;
			} else {
				if (tween._loop) {
					tween.cur = 0
					if (tween.onEnd) {
						tween.onEnd.call(tween.actor)
					}
					if (tween._reflect) {
						if (!tween.dir) {
							tween.dir = 1
						} else {
							tween.dir = 0
						}
					} else {
						tween.actor.apply(tween.original)
						tween.active = 0
					}
					return
				} else {
					if (tween.reset) {
						tween.actor.apply(tween.original)
					} else {
						// tween.actor.apply(tween.to)
						for(j=0;j!==tween.keys.length;j++){
							key = tween.keys[j];
							tween.actor[key] = tween.to[key];
						}
					}
					if (tween.onEnd) {
						tween.onEnd.call(tween.actor)
					}
					tween = null
					this.tweens[i] = null
					delete this.tweens[i]
				}
			}
		}
	}
}

Studio.Scene.prototype.update_property = function(tween, key, delta) {
	tween.actor[key] = tween.original[key] + (Studio.Ease[tween.ease](delta) * (tween.to[key] - tween.original[key]))
}

Studio._tween_object = function(who, ease, to, duration, onEnd, onStart) {
	this.actor = who
	this.ease = ease
	this.original = {}
	this.to = to
	this.cur = 0
	this.duration = duration
	this.onStart = onStart
	this.onEnd = onEnd
	this._loop = false
	this._reflect = true
	this.reset = false
	this.dir = 0
	this.active = 0
	this.id = null
	this.keys = Object.keys(to)
	this.next = null
	this.prev = null
}

Studio._tween_object.prototype.constructor = Studio._tween_object

Studio._tween_object.prototype.loop = function() {
	this._loop = true
	return this
}

Studio._tween_object.prototype.apply = function(a) {
	for (var key in a) {
		this[key] = a[key]
	}
	return this
}

Studio._tween_object.prototype.reflect = function(status) {
	this._reflect = status
	return this
}

Studio._tween_object.prototype.setActor = function(actor) {
	this.actor = actor
	return this
}

Studio.Scene.prototype.createTween = function(who, ease, to, duration, callback, onstart) {
	var temp = new Studio._tween_object(who, ease, to, duration, callback, onstart)
	temp.id = this.nextID

	for (var key in to) {
		temp.original[key] = who[key]
	}

	this.nextID++
	return temp
}

Studio._tween_object.prototype._snapshot = function() {
	for (var key in this.to) {
		this.original[key] = this.actor[key]
	}
}

Studio._tween_object.prototype.then = function(ease, to, duration, callback, onstart) {
	this.next = new Studio._tween_object(this.actor, ease, to, duration, callback, onstart)
	this.next.prev = this
	return this.next
}

Studio._tween_object.prototype.last = function() {
	var next = this.next
	var prev = this
	while (next !== null) {
		prev = next
		next = next.next
	}
	return prev
}

Studio._tween_object.prototype.completeLoop = function(who) {
	this.next = who
	who.prev = this
	return this.next
}

Studio.Scene.prototype.createLoop = function(who, ease, to, duration, callback) {
	this.tweens[this.nextID] = this.createTween(who,ease,to,duration,callback)
	this.tweens[this.nextID - 1].loop = true
	return this.tweens[this.nextID - 1]
}

Studio.Scene.prototype.addTween = function(who, ease, to, duration, callback) {
	this.tweens[this.nextID] = this.createTween(who,ease,to,duration,callback)
	return this.tweens[this.nextID - 1]
}

Studio.Scene.prototype.playTween = function(who) {
	who.cur = 0
	for (var j = 0; j !== who.keys.length; j++) {
		who.original[who.keys[j]] = who.actor[who.keys[j]]
	}
	this.tweens[who.id] = who
}

Studio.Scene.prototype.stopTween = function(who, snap, original) {
	if (this.tweens[who.id]) { // lets make sure the tween is active first
		who.cur = 0
		who.dir = 0
		if (snap) {
			var j
			if (original) {
				for (j = 0; j !== who.keys.length; j++) {
					who.actor[who.keys[j]] = who.original[who.keys[j]]
				}
			} else {
				for (j = 0; j !== who.keys.length; j++) {
					who.actor[who.keys[j]] = who.to[who.keys[j]]
				}
			}
		}
		this.tweens[who.id] = null
		delete this.tweens[who.id]
	}
}
