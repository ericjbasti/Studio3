Studio.Messenger = function() {
	this.listeners = []
	this.status = 0
}

Studio.Messenger.prototype.addListener = function(callback, who) {
	this.listeners.push({callback: callback,who: who})
	// reply back with current status when adding new listener.
	if (who) {
		who[callback].call(who,this.status)
	} else {
		callback(this.status)
	}
}

Studio.Messenger.prototype.setStatus = function(message) {
	this.status = message
	// now lets tell everyone that listens.
	var who = null
	for (var i = 0; i < this.listeners.length; i++) {
		who = this.listeners[i].who
		if (who) {
			who[this.listeners[i].callback].call(who,this.status)
		} else {
			this.listeners[i].callback(this.status)
		}
	}
}