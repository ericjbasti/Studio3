// A really simply pooling stystem.
// Opt-in
// to create a pool run: Studio.createPool (Object_Type, Initial_Size )
// to retreive from the pool run: Object_Type.fromPool()
// which will return an Object_Type from the pool if one is avalible, otherwise it will create a new one, and increase the size of the pool
// to send an item back into the pool. Just run .intoPool on the object. It will put it back into the Object_Type's pool.
//
// the pool and poolSize are private variables, however you can get access to the pool with a couple helper functions.
// Object_Type.getPoolCapacity() will return the .length of the pool array.
// Object_Type.getPool() will return the pool array itself, helpful for debugging.
// Object_Type.isPoolEmpty() will return true is the poolSize === 0. This can be helpful if you want to limit size of the pool.
//
// 		if(!Object_Type.isPoolEmpty){
//			... pull from the pool ...
//		}else{
//			... lets leave the pool alone ...
//		}
//

Studio.createPool = function(who, size) {
	var pool = []
	var poolSize = size || 0

	// we double check to make sure the constructor is set to ourself
	if (who.constructor != who) {
		who.constructor = who
	}

	for (var i = 0; i != poolSize; i++) {
		pool[i] = new who()
		if (pool[i].init) {
			pool[i].init()
		}
	}

	who.fromPool = function(properties) {
		var poolObject = pool[--poolSize]
		if (!poolObject) {
			poolObject = new who()
			poolSize++
		}
		pool[poolSize] = null
		if (properties) {
			poolObject.apply(properties)
		}
		return poolObject
	}

	who.prototype.intoPool = function() {
		pool[poolSize] = this
		poolSize++
	}
	who.getPoolCapacity = function() {
		return pool.length
	}
	who.getPool = function() {
		return pool
	}
	who.isPoolEmpty = function() {
		return poolSize === 0
	}
}