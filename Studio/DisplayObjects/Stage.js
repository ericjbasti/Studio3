/**
 * Stage
 * Where everything plays out.
 */

Studio.Stage = function(domID, attr) {

	// a very basic check for webgl support.
	// this will probably change later.
	this.webgl = false //!!window.WebGLRenderingContext;
	this.fullscreen = false
	this.color = new Studio.Color(0, 0, 0, 1) // defaults to black
	this.snap = false
	// Before we do anything we should apply any attached attributes.
	// to disable webgl even if the browser supports it:
	// you would send an object like this { webgl : false }
	// That will force the 2d context.
	if (attr) {
		this.apply(attr)
	}

	this._getCanvasElement(domID)
	this._count = 0
	this._maxCount = 16333
	this.dur = 1000 / 60
	this._d = this.dur / 2
	this.resolution = window.devicePixelRatio // defaults to device setting.
	this.interpolate = true
	this.smoothing = true

	if (attr) {
		this.apply(attr)
	}

	this._sizeCanvas(this.fullscreen)
	this.setPixelRatio()
	if (this.webgl && Studio.canWebGL) {
		this.engine = Studio.Stage.prototype.WEBGL
	} else {
		this.webgl = false
	}
	this.allowPlugins()

	// We need to prepare the canvas element for use.
	// First we need to grab the appropriate context based on the engine type
	this.engine.getContext.call(this)

	// Once the context is obtained we need to fire some actions on it
	// this is mainly for webgl, since it needs shaders and programs created
	this.engine.init.call(this, this.ctx)

	// One the basic are competed by the init we can apply more changes through
	// a prep call. Again mainly used by webgl to create holders for buffers and such.
	this.engine.prep.call(this, this.ctx)
	Studio.stages.push(this)
	this.render = this.engine.render
	// This is a universal init. These are items that need to be attached to the stage
	// regardless of engine type. These include items like buttons, cameras, scenes etc...
	this._init()
	console.log('%cStudio3 v' + Studio.version + '%c' + this.engine.type, Studio.infoStyle, Studio.engineStyle)
	this.verts = 0
	return this
}

Studio.extend(Studio.Stage, Studio.Scene)

Studio.Stage.prototype._getCanvasElement = function(domElementID) {
	if (domElementID) {
		if (domElementID.toLowerCase() === 'build') {
			this.canvas = document.createElement('canvas')
			document.body.appendChild(this.canvas)
			return
		}
		this.canvas = document.getElementById(domElementID)
	} else {
		// If an ID is not passed to us.
		// We will find the first Canvas element and use that.
		var temp = document.body.getElementsByTagName('canvas')
		if (!temp[0]) {
			// If we can't find a Canvas element on the page, we create one.
			this.canvas = document.createElement('canvas')
			document.body.appendChild(this.canvas)
		} else {
			// Otherwise we use the first one we see.
			this.canvas = temp[0]
		}
	}
}

Studio.Stage.prototype.setColor = function(r, g, b, a) {
	this.color.set(r, g, b, a)
	if (this.ctx.clearColor) {
		this.ctx.clearColor(this.color.r, this.color.g, this.color.b, this.color.a)
	}
}

Studio.Stage.prototype._init = function() {
	this.ready = false
	this.autoPause = false
	this._watching = false
	this.children = []
	this.buttons = []
	this.activeScene = null
	this.previousScene = null
	this.camera = new Studio.Camera(this)
	this.nextID = 0
	this.anchorX = 0
	this.anchorY = 0
	this.active = true
	this._pause_buttons = false

	// Studio.stages.push(this);
	Studio.stage = this
	return this
}

Studio.Scene.prototype.allowPlugins = function() {
	this.plugins = Object.create(null)
	this.plugins.input = []
	this.plugins.effect = []
	this._effects = 0
	this._inputs = 0
}

Studio.Stage.prototype._sizeCanvas = function(fullscreen) {
	this.height = this.canvas.height || this.height
	this.width = this.canvas.width || this.width
	this.canvas.style.height = this.height + 'px'
	this.canvas.style.width = this.width + 'px'
	this._scaleRatio = 1
	if (fullscreen == 1) {
		this.width = window.innerWidth
		this.height = window.innerHeight
		this.canvas.style.height = '100%'
		this.canvas.style.width = '100%'
	}
	if (fullscreen >= 2) {
		var innerWidth = window.innerWidth
		if (this.maxwidth && innerWidth > this.maxwidth) {
			innerWidth = this.maxwidth
		}
		this.canvas.style.width = innerWidth + 'px'
		this.canvas.style.height = 'auto'
		this._scaleRatio = innerWidth / this.width
		if (fullscreen == 3) {
			this.canvas.style.height = window.innerHeight + 'px'
		}
	}

}

Studio.Stage.prototype.pauseButtons = function(a) {
	this._pause_buttons = a
}

Studio.Stage.prototype.setPixelRatio = function() {
	this.canvas.width = this.width * this.resolution
	this.canvas.height = this.height * this.resolution
}
Studio.Stage.prototype.fillScreen = function() {
	// this._scaleRatio = window.innerHeight/this.height;
	// this.canvas.style.height = (this.height*this._scaleRatio) +'px';
	// this.canvas.style.width = (this.width*this._scaleRatio) +'px';

}
Studio.Stage.prototype.addInput = function(fn, options) {
	if (options) {
		fn._options(options)
	}
	fn.init(this)
	this.plugins.input.push(fn)
	this._inputs++
}

Studio.Stage.prototype.addEffect = function(fn, options) {
	if (options) {
		fn._options(options)
	}
	fn.init(this)
	this.plugins.effect.push(fn)
	this._effects++
}

Studio.Stage.prototype.checkDataAttributes = function() {
	// if(this.canvas.getAttribute('data-auto-pause')){
	// 	this.autoPause=(this.canvas.getAttribute('data-auto-pause')).toLowerCase()==='true';
	// }

	// if(this.canvas.getAttribute('data-watch')){
	// 	this.watch=(this.canvas.getAttribute('data-watch')).toLowerCase()==='true';
	// }
}

Studio.Stage.prototype.setScene = function(who) {
	who._parent = this
	if (this.activeScene && Studio.progress === 2) {
		if (this.activeScene.onDeactivate) {
			this.activeScene.onDeactivate(this)
		}
	}
	this.previousScene = this.activeScene
	this.activeScene = who
	this.activeScene.active = true
	if (who.onActivate) {
		who.onActivate(this)
	}
}

Studio.Stage.prototype.clearScene = function() {
	if (this.activeScene) {
		this.previousScene = this.activeScene
		this.activeScene = null
		if (this.previousScene.onDeactivate) {
			this.previousScene.onDeactivate(this)
		} else {
			this.previousScene.active = false
		}
	}
}

Studio.Stage.prototype.watch = function(who) {
	this._watching = who
	this.children = who.children
	this._hasChildren = who._hasChildren
}

Studio.Stage.prototype.update_children = function(ratio, delta, interpolate) {
	for (this.i = 0; this.i !== this._hasChildren; this.i++) {
		if (this.children[this.i].active) {
			this.children[this.i].update(ratio, delta, interpolate)
		}
	}
}

Studio.Stage.prototype.update_visibility = function() {
	this._alpha = this.alpha
}

/**
 * stage.update
 * This is different from the displayObject.update() because a stage will never have a _parent.
 * Yet it should still update its private variables.
 */
Studio.Stage.prototype._timebased_updates = function(delta) {
	if (this.activeScene) {
		this.activeScene.update_tweens(delta)
	}
	this.update_tweens(delta)
}

Studio.Stage.prototype.update = function(ratio, delta) {
	if (this.onEnterFrame) {
		this.onEnterFrame()
	}
	this._width = this.width
	this._height = this.height
	this._scaleX  = this.scaleX
	this._scaleY  = this.scaleY
	this._speed = this.camera.speed
	this.update_visibility()

	if (Studio.progress === 2) {

		if (this._inputs) {
			this.runInputs(delta)
		}
		this.updateScenes()

		if (this.beforeDraw) {
			this.beforeDraw()
		}
	}
	// if (this.logic) {
	// 	this.logic();
	// }
	this._logic()
}

Studio.Stage.prototype._update_scene = function(scene) {
	if (!scene) return
	if (scene.active) {
		scene.update(this.interpolate)
	}
}

Studio.Stage.prototype.updateScenes = function() {
	this._update_scene(this.activeScene)
	this._update_scene(this.previousScene)
	if (this._hasChildren || this._watching) {
		this.update_children(this.interpolate)
	}
}

Studio.Stage.prototype.runEffects = function() {
	// this.setAlpha(this.ctx);
	// this.ctx.setTransform(this.resolution, 0, 0,this.resolution,0,0);
	for (this.i = 0; this.i !== this._effects; this.i++) {
		if (this.plugins.effect[this.i].active) {
			this.plugins.effect[this.i].action(this)
		}
	}
}

Studio.Stage.prototype.runInputs = function() {
	// this.setAlpha(this.ctx);
	// this.ctx.setTransform(this.resolution, 0, 0,this.resolution,0,0);
	for (this.i = 0; this.i !== this._inputs; this.i++) {
		if (this.plugins.input[this.i].active) {
			this.plugins.input[this.i].action(this)
		}
	}
}

Studio.Stage.prototype.loading = function(delta) {

	if (Studio.loaded === true) { // BAD DESIGN! This should be based on each stage.
		// as it stands loading an image for one canvas will cause all to pause. oops.
		if (this.onReady) {
			this.onReady(delta)
		}
		this.loop = this.activeloop
	}
}

Studio.Stage.prototype.activeloop = function(delta) {
	if (Studio.progress === 2) {
		this.timeStep(delta)
		if (this._effects) {
			this.runEffects(delta)
		}
		return
	} else {
		// if(this.overlay_progress){
		// 	this.update_children();
		// 	this.draw(this.ctx);
		// 	this.timeStep(delta);
		// }

		if (!this.webgl) this.drawProgress(this.ctx, delta)

		if (Studio.progress === 1) {
			if (this.onReady) {
				this.onReady(delta)
			}
			Studio.progress = 2 // we set this to 2 so we can fire this event once.
			if (!this.activeScene) {
				return // lets check to see if we have a scene to draw. otherwise lets just draw the stage.
			}
			if (this.activeScene.onActivate) {
				this.activeScene.onActivate(this)
			}
		}
	}
}

Studio.Stage.prototype.loop = Studio.Stage.prototype.loading

Studio.Stage.prototype.drawProgress = function(ctx) {
	this.progressBar(ctx, Studio.progress)
	ctx.restore()
}

// default progress bar. overwire this to create your own.
Studio.Stage.prototype.progressBar = function(ctx, progress) {
	ctx.fillStyle = 'rgba(255,255,255,.8)'
	ctx.fillRect((this.width - 202) / 2, (this.height - 22) / 2, 202, 22)
	ctx.fillStyle = 'rgba(0,0,0,1)'
	ctx.fillRect(2 + (this.width - 202) / 2, 2 + (this.height - 22) / 2, progress * 198, 18)
}

