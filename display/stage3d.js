Studio.Stage3d = function(who) {
	
	this.canvas = document.getElementById(who);
	this.ctx = this.canvas.getContext('webgl', {antialias: false});
	this.ctx.viewportWidth = this.canvas.width;
	this.ctx.viewportHeight = this.canvas.height;

	this.ctx._count = 0;

	this.ctx._batch = new Float32Array(12 * 100000);

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
	this.ctx.enable(this.ctx.DEPTH_TEST);
	this.ctx.depthFunc(this.ctx.LEQUAL);
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
		gl._batch[gl._count + 3] = this._col[0];
		gl._batch[gl._count + 4] = this._col[1];
		gl._batch[gl._count + 5] = this._col[2];
		gl._batch[gl._count + 6] = 1;
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

Studio.Stage3d.prototype.addEffect = function(fn, options) {
	console.log(fn)
	// if(options){
	// 	fn._options(options);
	// }
	fn.init(this);
	this.plugins.effect.push(fn);
	this._effects++;
};
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
	if (this.hasChildren || this._watching) {
		if (!this._watching) {
			this.update_children();
		}else {
			this.hasChildren = this._watching.hasChildren;
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
	for (this.i = 0; this.i !== this.hasChildren; this.i++) {

		if (this.children[this.i].active) {
			this.children[this.i].render(this);
		}
	}
};
Studio.Stage3d.prototype.render = function(gl) {

	gl._count = 0;
	if (this.hasChildren) {
		this.render_children(gl);
	}

	gl.bufferData(gl.ARRAY_BUFFER, gl._batch, gl.STATIC_DRAW);
	
	gl.drawArrays(gl.TRIANGLES, 0, GAME.children.length * 6);
}
