var LinkedList = function(duplicatesAddToEnd) {
	this.first 	= 	null
	this.last	= 	null
	this.length = 	0
	this._duplicatesAddToEnd = duplicatesAddToEnd || false
}

LinkedList.prototype = {
	add: function(who) {
		if(this.isInList(who)) return

		this.length++ // add to our length so we can easily tell how big our list is.
		if (this.length <= 1 && this.first === null && this.last === null) {
			this.first = who
			this.last = who
			who.prev = null
			this.length = 1
			return who
		}
		// this.first.prev = who;
		this.last.next = who // we add the new item to the previously last item.
		who.prev = this.last // we mark the new items previous to be the last item in the list.
		this.last = who // we have a new last item now.
		return who
	},
	addItems: function(who) {
		for (var i = 0; i !== arguments.length; i++) {
			this.add(arguments[i])
		}
	},
	isInList: function(a){
		var listItem = this.first
		while (listItem) {
			if(listItem==a) {
				if(this._duplicatesAddToEnd){
					console.warn(a+' is already in this list. Swapped to end of list.')
					this.remove(a)
					return false
				}
				console.warn(a+' is already in this list. Duplicate was not added.')
				return true
			}
			listItem = listItem.next || this.next
		}
		return false
	},
	insert: function(a, b) {
		if(this.isInList(a)) return
		this.length++
		a.prev = b
		if (b !== this.last) {
			b.next = a
		} else {
			this.last = a
			a.next = this.first
		}
	},
	init: function() {
		this.next	=	null
		this.prev	=	null
		this.first 	= 	null
		this.last	= 	null
		this.length = 	0
	},
	remove: function(who) {
		if (this.length === 1) {
			this.init()
			who.next = null
			who.prev = null
			return // nothing to see here lets move on.
		}
		// check for the begining or the end of the list
		if (this.first === who) {
			this.first = this.first.next
		} else if (this.last === who) {
			this.last = this.last.prev
		}

		// debugger;
		if (who.prev) {
			who.prev.next = who.next
		}
		if (who.next) {
			who.next.prev = who.prev
		}

		who.next = null
		who.prev = null

		if (this.first === null) {
			this.last = null
		}
		this.length--
	},
	update: function(r, d) {
		var listItem = this.first
		while (listItem) {
			// while we still have a list item lets do some fun stuff.

			this.next = listItem.next
			// we need to hold on to the next in line.
			// WHY: I've been known to delete an object in the list
			// thus causing listItem.next to return null.
			// By saving this reference we can always continue on
			// through the list.

			listItem.update(r, d)
			// lets perform the objects update function.

			listItem = listItem.next || this.next
			// if the item has a next lets use it. otherwise lets use the one we saved
			// just for this occassion. If both are null thats fine to.
			// we really are at the end of the list.
		}
	},
	render: function(e, f) {
		var listItem = this.first
		while (listItem) {
			this.next = listItem.next
			listItem._delta(f)
			listItem.render(e, f)
			listItem = listItem.next || this.next
		}
	},
	action: function(what) {
		var listItem = this.first
		while (listItem) {
			this.next = listItem.next
			listItem[what]()
			listItem = listItem.next || this.next
		}
	},
	each: function(what){
		var listItem = this.first
		var count = 0
		while (listItem) {
			this.next = listItem.next
			what(listItem,count)
			count++;
			listItem = listItem.next || this.next
		}
	},
	removeAll: function(exception) {
		var listItem = this.first
		while (listItem) {
			this.next = listItem.next
			if (this.pdispose) {
				this.pdispose()
			}
			this.remove(listItem)
			listItem = listItem.next || this.next
		}
		listItem = null
		if (exception) {
			this.add(exception)
		}
	},
	toString: function() {
		var listItem = this.first
		var toString = 'linked list : ['
		while (listItem) {
			toString += listItem
			listItem = listItem.next
		}
		toString += '];'
	},
	constructor: LinkedList
}
