"use strict"

/**
 * Stage
 * Where everything plays out.
 */
Studio.Stage = function(canvas, fullscreen) {
	console.log(canvas)
	if (!window.ejecta) {
		this.canvas = document.getElementById(canvas);
	}else { // ejecta only supports a canvas with the id of 'canvas'. so we use that instead.
		this.canvas = document.getElementById('canvas');
	}
	this.ctx = this.canvas.getContext('2d');
	this.height = this.canvas.height;
	this.width = this.canvas.width;
	this.canvas.style.height = this.height + 'px';
	this.canvas.style.width = this.width + 'px';
	this._scaleRatio = 1;
	if (fullscreen) {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.canvas.style.height = '100%';
		this.canvas.style.width = '100%';
	}
	this.setPixelRatio();
	this.ready = false;
	this.autoPause = false;
	this._watching = false;
	Studio.stages.push(this); // for multiple stages
	// Studio.stage = this;
	this.camera = new Studio.Camera(this);
	
	this.plugins = Object.create(null);
	this.plugins.input = [];
	this.plugins.effect = [];
	this._effects = 0;
	this.snapPixels = false;
	this.children = [];
	this.buttons = [];
	this.activeScene = null;
	this.previousScene = null;
	this.checkDataAttributes();
	this.tweens = Object.create(null);
	this.tween_length = 0;
	this.nextID = 0;
	this.anchorX = 0 ;
	this.anchorY = 0 ;
	this.active = true;
	this._pause_buttons = false;
	if (this.ctx.resolution !== 1) {
		this.ctx.setTransform(this.ctx.resolution, 0, 0, this.ctx.resolution, 0, 0);
	}
	return this;
};

Studio.Stage.prototype = new Studio.Scene();
Studio.Stage.prototype.constructor = Studio.Stage;

Studio.Stage.prototype.pauseButtons = function(a) {
	this._pause_buttons = a;
}

Studio.Stage.prototype.setPixelRatio = function(pixelRatio) {
	this.ctx.resolution = pixelRatio || window.devicePixelRatio;
	this.canvas.width = this.width * this.ctx.resolution;
	this.canvas.height = this.height * this.ctx.resolution;
};
Studio.Stage.prototype.fillScreen = function(type) {
	// this._scaleRatio = window.innerHeight/this.height;
	// this.canvas.style.height = (this.height*this._scaleRatio) +'px';
	// this.canvas.style.width = (this.width*this._scaleRatio) +'px';

};
Studio.Stage.prototype.addInput = function(fn) {
	this.plugins.input.push(fn);
};

Studio.Stage.prototype.addEffect = function(fn, options) {
	if (options) {
		fn._options(options);
	}
	fn.init(this);
	this.plugins.effect.push(fn);
	this._effects++;
};

Studio.Stage.prototype.checkDataAttributes = function() {
	// if(this.canvas.getAttribute('data-auto-pause')){
	// 	this.autoPause=(this.canvas.getAttribute('data-auto-pause')).toLowerCase()==='true';
	// }

	// if(this.canvas.getAttribute('data-watch')){
	// 	this.watch=(this.canvas.getAttribute('data-watch')).toLowerCase()==='true';
	// }
};

Studio.Stage.prototype.setScene = function(who) {
	who._parent = this;
	if (this.activeScene && Studio.progress === 2) {
		if (this.activeScene.onDeactivate) {
			this.activeScene.onDeactivate();
		}
	}
	this.previousScene = this.activeScene;
	this.activeScene = who;
	this.activeScene.active = true;
	if (who.onActivate) {
		who.onActivate();
	}
};

Studio.Stage.prototype.watch = function(who) {
	this._watching = who;
	this.children = who.children;
	this._hasChildren = who._hasChildren;
};

Studio.Stage.prototype.addButton = function(who) {
	this.buttons.unshift(who);
};

Studio.Stage.prototype.update_children = function() {
	for (this.i = 0; this.i !== this._hasChildren; this.i++) {
		if (this.children[this.i].active) {
			this.children[this.i].update();
		}
	}
};

Studio.Stage.prototype.render_children = function() {
	for (this.i = 0; this.i !== this._hasChildren; this.i++) {
		if (this.children[this.i].active) {
			this.children[this.i].render(this);
		}
	}
};
Studio.Stage.prototype.update_visibility = function() {
	this._alpha = this.alpha;
}
/**
 * stage.update
 * This is different from the displayObject.update() because a stage will never have a _parent.
 * Yet it should still update its private variables.
 */
Studio.Stage.prototype.update = function() {
	if (this.onEnterFrame) {
		this.onEnterFrame();
	}

	this._width = this.width;
	this._height = this.height;
	this._scaleX  = this.scaleX;
	this._scaleY  = this.scaleY;
	this._speed = this.camera.speed;
	// this.update_visibility();
	if (Studio.progress === 2) {
		if (this.camera.active) {
			this.camera.update(this);
		}
		this.update_tweens();
		if (this.activeScene) {
			this.activeScene.update();
		}
		if (this.previousScene) {
			if (this.previousScene.active) {
				this.previousScene.update();
			}
		}
		if (this._hasChildren || this._watching) {
			if (!this._watching) {
				this.update_children();
			}else {
				this._hasChildren = this._watching._hasChildren;
			}
		}
		if (this.beforeDraw) {
			this.beforeDraw();
		}
	}
	//this.camera.update(this);
};

// our render function draws everything to the screen then updates them
// we want to draw everything to the screen as fast as possible. Then we
// can worry about user input and tweens. This should help prevent certain
// situation that could cause the frames to drop.

Studio.Stage.prototype.render = function(ratio) {
	if (this.camera.active) {
		this.camera.update(this);
		this.camera.render(this);
	}
	if (this.activeScene) {
		if (this.activeScene.beforeDraw) {
			this.activeScene.beforeDraw();
		}
		this.activeScene.render(this);
	}
	if (this.previousScene) {
		if (this.previousScene.active) {
			this.previousScene.render(this);
		}
	}
	if (this._hasChildren) {
		this.render_children();
	}
}

Studio.Stage.prototype.runEffects = function(delta) {
	this.setAlpha(this.ctx);
	this.ctx.setTransform(this.ctx.resolution, 0, 0, this.ctx.resolution, 0, 0);
	for (this.i = 0; this.i !== this._effects; this.i++) {
		this.plugins.effect[this.i].action(this);
	}
}

// Studio.Stage.prototype.dur = 1000/60;
// Studio.Stage.prototype._d = 0;

Studio.Stage.prototype.loop = function(delta) {
	this.ctx.setTransform(this.ctx.resolution, 0, 0, this.ctx.resolution, 0, 0);
	this.draw(this.ctx);
	if (Studio.progress === 2) {
		
		//this._d += delta;

		this.render(delta);

		//if(this._d >= this.dur){
		//	this._d -= this.dur;
		//	Studio.frameRation = this.dur;
		this.update();
		//}
		
		if (this.onExitFrame) {
			this.onExitFrame();
		}

		if (this._effects) {
			this.runEffects(delta);
		}
		return;

	}else {
		this.drawProgress(this.ctx);
		if (Studio.progress === 1) {
			Studio.progress = 2; // we set this to 2 so we can fire this event once.
			if (!this.activeScene) {
				return; // lets check to see if we have a scene to draw. otherwise lets just draw the stage.
			}
			if (this.activeScene.onActivate) {
				this.activeScene.onActivate();
			}
		}
	}
};

Studio.Stage.prototype.drawProgress = function(ctx) {
	ctx.setTransform(ctx.resolution1, 0, 0, ctx.resolution, 0, 0);
	this.progressBar(ctx, Studio.progress);
	ctx.restore();
};

// default progress bar. overwire this to create your own.
Studio.Stage.prototype.progressBar = function(ctx, progress) {
	ctx.fillStyle = 'rgba(255,255,255,.8)';
	ctx.fillRect((this.width - 202) / 2, (this.height - 22) / 2, 202, 22);
	ctx.fillStyle = 'rgba(0,0,0,1)';
	ctx.fillRect(2 + (this.width - 202) / 2, 2 + (this.height - 22) / 2, progress * 198, 18);
};

// Studio.Rect.prototype._points = new Float32Array([
// 	0,0,
// 	1,1,
// 	0,1,
// 	0,1,
// 	1,0,
// 	1,1
// 	]);

Studio.Stage3d = function(who) {
	
	this.canvas = document.getElementById(who);
	this.ctx = this.canvas.getContext('webgl', {antialias: false , alpha: false});
	this.ctx.viewportWidth = this.canvas.width;
	this.ctx.viewportHeight = this.canvas.height;

	this.ctx._count = 0;

	this.ctx._batch = new Float32Array(12 * 120000);
	this.camera = new Studio.Camera(this);
	this.height = this.canvas.height;
	this.width = this.canvas.width;
	this.canvas.style.height = this.height + 'px';
	this.canvas.style.width = this.width + 'px';
	// this.setPixelRatio(2);
	this.vertexShader = this.ctx.createShader(this.ctx.VERTEX_SHADER);
	this.loadShader(this.vertexShader , 'shader-vs');

	this.ctx.compileShader(this.vertexShader);

	this.fragmentShader = this.ctx.createShader(this.ctx.FRAGMENT_SHADER);
	this.loadShader(this.fragmentShader , 'shader-fs');

	this.ctx.compileShader(this.fragmentShader);
	// this.ctx.enable(this.ctx.DEPTH_TEST);
	//    this.ctx.depthFunc(this.ctx.LEQUAL);
	this.program = this.ctx.createProgram();
	this.ctx.attachShader(this.program, this.vertexShader);
	this.ctx.attachShader(this.program, this.fragmentShader);

	this.ctx.linkProgram(this.program);

	this.ctx.useProgram(this.program);

	this.buffer = this.ctx.createBuffer();

	this.init(this.ctx);

	Studio.stages.push(this);

	this.plugins = {
		effect: []
	}
	this._effects = 0;

	Studio.Rect.prototype.addVert = function(gl, x, y, z) {
		gl._batch[gl._count] = x;
		gl._batch[gl._count + 1] = y;
		gl._batch[gl._count + 2] = z;
		gl._batch[gl._count + 3] = this._col[0]
		gl._batch[gl._count + 4] = this._col[1]
		gl._batch[gl._count + 5] = this._col[2]
		gl._batch[gl._count + 6] = .5;
		gl._count += 6;
	}

	Studio.Rect.prototype.setColor = function(r, g, b) {
		this._col[0] = r;
		this._col[1] = g;
		this._col[2] = b;
	}

	Studio.Rect.prototype._col = new Float32Array(3);

	Studio.Rect.prototype.draw = function(gl) {

		this.__x1 = this._x - this._width * this.anchorX;
		
		this.__x2 = this.__x1 + this._width;

		this.__y1 = this._y - this._height * this.anchorY;

		this.__y2 = this.__y1 + this._height;
		// gl._batch[count]
		
		// console.log(count)
		// gl._batch[count+0] = gl._batch[count+4] = gl._batch[count+6]= x1;
		// gl._batch[count+1] = gl._batch[count+3] = gl._batch[count+9]= y1;

		// gl._batch[count+2] = gl._batch[count+8] = gl._batch[count+10]= x2;
		// gl._batch[count+5] = gl._batch[count+7] = gl._batch[count+11]= y2;

		this.addVert(gl, this.__x1, this.__y1, this._z);
		this.addVert(gl, this.__x2, this.__y1, this._z);
		this.addVert(gl, this.__x1, this.__y2, this._z);

		this.addVert(gl, this.__x1, this.__y2, this._z);
		this.addVert(gl, this.__x2, this.__y1, this._z);
		this.addVert(gl, this.__x2, this.__y2, this._z);

		// gl.bufferData(gl.ARRAY_BUFFER, this._points, gl.DYNAMIC_DRAW);
		
		// gl.drawArrays(gl.TRIANGLES, 0, 6);
	};
}

Studio.Stage3d.prototype = new Studio.Scene();
Studio.Stage3d.prototype.constructor = Studio.Stage3d;

"use strict"

Studio.Stage3d.prototype.init = function(gl) {
	gl.resolutionLocation = gl.getUniformLocation(this.program, "u_resolution");

	gl.positionLocation = gl.getAttribLocation(this.program, "a_position");
	gl.enableVertexAttribArray(0);

	gl.colorLocation = gl.getAttribLocation(this.program, "a_color");

	gl.uniform2f(gl.resolutionLocation, this.ctx.viewportWidth, this.ctx.viewportHeight);
	gl.bindAttribLocation(this.program, 0, 'a_position');
	gl.bindAttribLocation(this.program, 12, 'a_color');
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
	// gl.bufferData(gl.ARRAY_BUFFER, gl._batch, gl.STATIC_DRAW);

	gl.enableVertexAttribArray(gl.positionLocation);
	gl.enableVertexAttribArray(gl.colorLocation);
	gl.vertexAttribPointer(gl.positionLocation, 2, gl.FLOAT, false, 24, 0);
	gl.vertexAttribPointer(gl.colorLocation, 4, gl.FLOAT, false, 24, 12);

	// gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
	
}

Studio.Stage3d.prototype.addEffect = Studio.Stage.prototype.addEffect;
Studio.Stage3d.prototype.runEffects = function(delta) {
	// this.setAlpha(this.ctx);
	// this.ctx.setTransform(this.ctx.resolution, 0, 0,this.ctx.resolution,0,0);
	for (this.i = 0; this.i !== this._effects; this.i++) {
		this.plugins.effect[this.i].action(this);
	}
}
Studio.Stage3d.prototype.loadShader = function(who, shader) {
	var shaderScript = document.getElementById(shader);

	var str = '';
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}
	this.ctx.shaderSource(who, str);
}

Studio.Stage3d.prototype.loop = function(delta) {
	// this.draw(this.ctx);
	this.render(this.ctx);
	this.update();
	if (this.onExitFrame) {
		this.onExitFrame();
	}
	if (this._effects) {
		this.runEffects(delta);
	}
};

Studio.Stage3d.prototype.update = function() {
	if (this.onEnterFrame) {
		this.onEnterFrame();
	}

	this._width = this.width;
	this._height = this.height;
	this._scaleX  = this.scaleX;
	this._scaleY  = this.scaleY;
	this._speed = 1;
	// this.update_visibility();
		
	// this.update_tweens();
	if (this.activeScene) {
		this.activeScene.update();
	}
	if (this.previousScene) {
		if (this.previousScene.active) {
			this.previousScene.update();
		}
	}
	if (this._hasChildren || this._watching) {
		if (!this._watching) {
			this.update_children();
		}else {
			this._hasChildren = this._watching._hasChildren;
		}
	}
	if (this.beforeDraw) {
		this.beforeDraw();
	}
	
	//this.camera.update(this);
};

Studio.Stage3d.prototype.setPixelRatio = function(pixelRatio) {
	this.ctx.resolution = pixelRatio || window.devicePixelRatio;
	this.canvas.width = this.width * this.ctx.resolution;
	this.canvas.height = this.height * this.ctx.resolution;
};

Studio.Stage3d.prototype.render_children = function() {
	for (this.i = 0; this.i !== this._hasChildren; this.i++) {
		if (this.children[this.i].active) {
			this.children[this.i].render(this);
		}
	}
};
Studio.Stage3d.prototype.render = function(gl) {

	gl._count = 0;
	if (this._hasChildren) {
		this.render_children(gl);
	}

	gl.bufferData(gl.ARRAY_BUFFER, gl._batch, gl.STATIC_DRAW);
	
	gl.drawArrays(gl.TRIANGLES, 0, GAME.children.length * 6);
}
