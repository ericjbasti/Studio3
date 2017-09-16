Studio.Messenger = function() {
	this.listeners = {}
	this.message = 0
}
Studio.Messenger.constructor = Studio.Messenger;
Studio.Messenger.prototype.addListener = function(type,callback) {
	if(!this.listeners[type]){
		this.listeners[type]=[];
	}
	this.listeners[type].push({callback: callback})
}

Studio.Messenger.prototype.addListenerTo = function(type,callback, who) {

	if(!this.listeners[type]){
		this.listeners[type]=[];
	}
	
	this.listeners[type].push({callback: callback,who: who})
}

Studio.Messenger.prototype.sendMessage = function(type, message) {
	this.message = message
	// now lets tell everyone that listens.
	
	var who = null

	if(!this.listeners[type]){
		return
	}

	for (var i = 0; i < this.listeners[type].length; i++) {
		who = this.listeners[type][i].who
		if (who) {
			who[this.listeners[type][i].callback].call(who,this.message,type)
		} else {
			this.listeners[type][i].callback(this.message,type)
		}
	}
}