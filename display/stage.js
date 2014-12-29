/**
 * Stage
 * Where everything plays out.
 */
Studio.Stage = function(canvas,webgl,attr){
	this._getCanvasElement(canvas);
	this.color = Studio.BLUE; // defaults to a
	this._count = 0;
	this._maxCount = 500;
	if(attr){
		this.apply(attr);
	}
	this._sizeCanvas();
	this.setPixelRatio(1);
	if(webgl){
		this._webgl();
		//this.loop = this._loopGL;
	}else{
		this._2d();
		this.loop = this._loop2d;
	}
	
	this.allowPlugins();
	this._init();

	return this;
};

Studio.Stage.prototype = new Studio.Scene();
Studio.Stage.prototype.constructor = Studio.Stage;

Studio.Stage.prototype._getCanvasElement = function(canvas){
	if(!window.ejecta){
		this.canvas = document.getElementById(canvas);
	}else{ // ejecta only supports a canvas with the id of 'canvas'. so we use that instead.
		this.canvas = document.getElementById('canvas');
	}
}

Studio.Stage.prototype._2d = function(a){
	this.ctx = this.canvas.getContext('2d');
}
Studio.Stage.prototype._webgl = function(a){
	this.ctx = this.canvas.getContext('webgl', { antialias:false, premultipliedAlpha:false, stencil:true });
	Studio.Rect.prototype.draw = Studio.Rect.prototype.buildVerts;
	Studio.Sprite.prototype.draw = Studio.Rect.prototype.buildVerts;
	this._init_webgl(this.ctx);
}
Studio.Stage.prototype.loadShader = function(who, shader){
	var shaderScript = document.getElementById(shader);
	var str = '';
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}
	this.ctx.shaderSource(who,str);
}




Studio.STANDARD_FRAG_SHADER = "precision mediump float;\nvarying vec4 v_color;\nvoid main() {\ngl_FragColor = v_color;\n}";
Studio.STANDARD_VERT_SHADER = "attribute vec3 a_position;\nattribute vec4 a_color;\nattribute vec2 a_texture;\nuniform vec2 u_resolution;\nvarying vec4 v_color;\nvarying vec2 v_texture;\nvoid main(void) {\nvec2 canvas_coords = ((vec2(a_position.x,a_position.y)/ u_resolution)*2.0) - 1.0;\ngl_Position = vec4(canvas_coords * vec2(1.0,-1.0), a_position.z, 1.0);\nv_color = a_color;\nv_texture = a_texture;\n}";



Studio.Stage.prototype._init_webgl = function(gl){
	gl._count = 0;
	gl._batch = new Float32Array(16355*32);
	gl.clearColor(this.color.r, this.color.g, this.color.b, this.color.a);
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
	this.loadShader(this.vertexShader ,'shader-vs');
	// gl.shaderSource(this.vertexShader,Studio.STANDARD_VERT_SHADER)
	gl.compileShader(this.vertexShader);

	this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	this.loadShader(this.fragmentShader , 'shader-fs');
	// gl.shaderSource(this.fragmentShader,Studio.STANDARD_FRAG_SHADER)
	gl.compileShader(this.fragmentShader);


	// gl.enable(gl.DEPTH_TEST);
 //    gl.depthFunc(gl.LESS);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    // gl.disable(gl.DEPTH_TEST);

	this.program = gl.createProgram();
	gl.attachShader(this.program, this.vertexShader);
	gl.attachShader(this.program, this.fragmentShader);

	gl.linkProgram(this.program);

	gl.useProgram(this.program);

	this.buffer = gl.createBuffer();

	this.prepGL(gl);
}

Studio.Stage.prototype.prepGL = function(gl){
	gl.resolutionLocation = gl.getUniformLocation(this.program,"u_resolution");

	gl.enableVertexAttribArray(0);

	gl.positionLocation = gl.getAttribLocation(this.program, "a_position");
	

	gl.colorLocation = gl.getAttribLocation(this.program, "a_color");

	gl.textureLocation = gl.getAttribLocation(this.program, "a_texture");

	gl.uniform2f(gl.resolutionLocation, this.width, this.height);
	// gl.bindAttribLocation(this.program, 0, 'a_position');
	// gl.bindAttribLocation(this.program, 8, 'a_color');
	// gl.bindAttribLocation(this.program, 24, 'a_texture');

	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

	gl.enableVertexAttribArray(gl.positionLocation);
	gl.enableVertexAttribArray(gl.colorLocation);
	gl.enableVertexAttribArray(gl.textureLocation);

	gl.vertexAttribPointer(gl.positionLocation, 2, gl.FLOAT, false, 32, 0);
	gl.vertexAttribPointer(gl.colorLocation, 4, gl.FLOAT, false, 32, 8);
	gl.vertexAttribPointer(gl.textureLocation, 2, gl.FLOAT, false, 32, 24);

	this._rect_index_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._rect_index_buffer);
	this._rect_index = new Uint16Array(this._maxCount*6);

	for (var i=0, j=0; i < this._maxCount*6; i += 6, j += 4)
    {
        this._rect_index[i + 0] = j + 0;
        this._rect_index[i + 1] = j + 1;
        this._rect_index[i + 2] = j + 2;
        this._rect_index[i + 3] = j + 1;
        this._rect_index[i + 4] = j + 2;
        this._rect_index[i + 5] = j + 3;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._rect_index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._rect_index, gl.STATIC_DRAW);
	this._r_count = 0;
}


Studio.Stage.prototype.setColor = function(r,g,b,a){
	this.color.set(r,g,b,a);
	if(this.ctx.clearColor){
		this.ctx.clearColor(this.color.r, this.color.g, this.color.b, this.color.a);
	}
}

Studio.Stage.prototype._init = function(a){
	this.ready = false;
	this.autoPause = false;
	this._watching = false;
	this.children = [];
	this.buttons = [];
	this.activeScene = null;
	this.previousScene = null;
	this.camera = new Studio.Camera(this);
	this.tweens = Object.create(null);
	this.tween_length=0;
	this.nextID = 0;
	this.anchorX = 0 ;
	this.anchorY = 0 ;
	this.active = true;
	this._pause_buttons = false;

	//Studio.stages.push(this);
		Studio.stage= this;
	return this;
}

Studio.Stage.prototype.allowPlugins = function(a){
	this.plugins = Object.create(null);
	this.plugins.input=[];
	this.plugins.effect=[];
	this._effects = 0;
}

Studio.Stage.prototype._sizeCanvas = function(fullscreen){
	this.height = this.canvas.height;
	this.width = this.canvas.width;
	this.canvas.style.height= this.height+'px';
	this.canvas.style.width= this.width+'px';
	this._scaleRatio = 1;
	// if(fullscreen){
	// 	this.width = window.innerWidth;
	// 	this.height = window.innerHeight;
	// 	this.canvas.style.height= '100%';
	// 	this.canvas.style.width= '100%';
	// }
}


Studio.Stage.prototype.pauseButtons = function(a){
	this._pause_buttons = a;
}

Studio.Stage.prototype.setPixelRatio = function (pixelRatio) {
	this.resolution = pixelRatio || window.devicePixelRatio;
	this.canvas.width = this.width * this.resolution;
	this.canvas.height = this.height * this.resolution;
};
Studio.Stage.prototype.fillScreen = function (type) {
	// this._scaleRatio = window.innerHeight/this.height;
	// this.canvas.style.height = (this.height*this._scaleRatio) +'px';
	// this.canvas.style.width = (this.width*this._scaleRatio) +'px';

};
Studio.Stage.prototype.addInput = function(fn) {
	this.plugins.input.push(fn);
};

Studio.Stage.prototype.addEffect = function(fn, options) {
	if(options){
		fn._options(options);
	}
	fn.init(this);
	this.plugins.effect.push(fn);
	this._effects++;
};

Studio.Stage.prototype.checkDataAttributes = function(){
	// if(this.canvas.getAttribute('data-auto-pause')){
	// 	this.autoPause=(this.canvas.getAttribute('data-auto-pause')).toLowerCase()==='true';
	// }

	// if(this.canvas.getAttribute('data-watch')){
	// 	this.watch=(this.canvas.getAttribute('data-watch')).toLowerCase()==='true';
	// }
};

Studio.Stage.prototype.setScene = function(who){
	who.parent = this;
	if (this.activeScene && Studio.progress === 2){
		if (this.activeScene.onDeactivate){
			this.activeScene.onDeactivate();
		}
	}
	this.previousScene = this.activeScene;
	this.activeScene = who;
	this.activeScene.active=true;
	if (who.onActivate){
		who.onActivate();
	}
};

Studio.Stage.prototype.watch = function(who){
	this._watching = who;
	this.children = who.children;
	this.hasChildren = who.hasChildren;
};

Studio.Stage.prototype.addButton = function(who){
	this.buttons.unshift(who);
};

Studio.Stage.prototype.update_children = function(ratio,delta){
	for (this.i = 0; this.i!==this.hasChildren; this.i++){
		if(this.children[this.i].active){
			this.children[this.i].update(ratio,delta);
		}
	}
};
Studio.Stage.prototype.render_children = function(){
	for (this.i = 0; this.i!==this.hasChildren; this.i++){
		if(this.children[this.i].active){
			this.children[this.i].render(this);
		}
	}
};
Studio.Stage.prototype.update_visibility = function(){
	this._alpha = this.alpha;
}
/**
 * stage.update
 * This is different from the displayObject.update() because a stage will never have a parent.
 * Yet it should still update its private variables.
 */
Studio.Stage.prototype.updateGL = function(ratio,delta){
	if (this.onEnterFrame){
		this.onEnterFrame(ratio,delta);
	}
	this.update_tweens(ratio,delta);
	this.update_children(ratio,delta);

	// this.camera.update(this);
};
Studio.Stage.prototype.update = function(ratio,delta){
	if (this.onEnterFrame){
		this.onEnterFrame(ratio,delta);
	}

	this._width = this.width;
	this._height = this.height;
	this._scaleX  = this.scaleX;
	this._scaleY  = this.scaleY;
	this._speed = this.camera.speed;
	this.update_visibility();
	if(Studio.progress===2){
		// if(this.camera.active){
		// 	this.camera.update(this);
		// }
		this.update_tweens(ratio,delta);
		if(this.activeScene){
			this.activeScene.update(ratio,delta);
		}
		if(this.previousScene){
			if(this.previousScene.active){
				this.previousScene.update(ratio,delta);
			}
		}
		if (this.hasChildren || this._watching){
			// if(!this._watching){
				this.update_children(ratio,delta);
			// }else{
			// 	this.hasChildren=this._watching.hasChildren;
			// }
		}
		if (this.beforeDraw){
			this.beforeDraw(ratio,delta);
		}
	}
	// this.camera.update(this);
};

// our render function draws everything to the screen then updates them
// we want to draw everything to the screen as fast as possible. Then we
// can worry about user input and tweens. This should help prevent certain
// situation that could cause the frames to drop.

Studio.Stage.prototype.render = function(ratio,delta){
	if(this.camera.active){
		this.camera.update(this);
		this.camera.render(this);
	}
	if(this.activeScene){
		if (this.activeScene.beforeDraw) {
			this.activeScene.beforeDraw();
		}
		this.activeScene.render(this);
	}
	if(this.previousScene){
		if(this.previousScene.active){
			this.previousScene.render(this);
		}
	}
	if(this.hasChildren){
		this.render_children();
	}
}

var drawmethod = 'DYNAMIC_DRAW';


Studio.Stage.prototype.renderGL = function(gl){
	gl._count = 0;
	if(this.hasChildren){
		this.render_children(gl);
	}

	gl.bufferData(gl.ARRAY_BUFFER, gl._batch, gl.DYNAMIC_DRAW);
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	// gl.drawArrays(gl.TRIANGLES, 0, this.children.length*6);
	gl.drawElements(gl.TRIANGLES, this._maxCount*6, gl.UNSIGNED_SHORT, 0);  

}


Studio.Stage.prototype.runEffects = function(delta){
	// this.setAlpha(this.ctx);
	// this.ctx.setTransform(this.ctx.resolution, 0, 0,this.ctx.resolution,0,0);
	for (this.i = 0; this.i !== this._effects; this.i++) {
		this.plugins.effect[this.i].action(this);
	}
}

// Studio.Stage.prototype.dur = 1000/60;
// Studio.Stage.prototype._d = 0;

Studio.Stage.prototype._loop2d = function(ratio,delta){
	this.ctx.setTransform(this.resolution, 0, 0,this.resolution,0,0);
	this.draw(this.ctx);
	if(Studio.progress===2){
		
		//this._d += delta;

		this.render();

		//if(this._d >= this.dur){
		//	this._d -= this.dur;
		//	Studio.frameRation = this.dur;
			this.update(ratio,delta);
		//}
		

		if (this.onExitFrame) {
			this.onExitFrame();
		}


		if(this._effects){
			this.runEffects(delta);
		}
		return;

	}else{
		this.drawProgress(this.ctx);
		if(Studio.progress===1){
			if(this.onReady){
				this.onReady(ratio,delta);
			}
			Studio.progress = 2; // we set this to 2 so we can fire this event once.
			if(!this.activeScene) {
				return; // lets check to see if we have a scene to draw. otherwise lets just draw the stage.
			}
			if(this.activeScene.onActivate){
				this.activeScene.onActivate();
			}
		}
	}
};

Studio.Stage.prototype.loading = function(){

}


Studio.Stage.prototype.loop = function(ratio,delta){
	if(Studio.progress===2){
		this.renderGL(this.ctx);
		this.updateGL(ratio,delta);
		return;
	}else{
		if(Studio.progress===1){
			Studio.progress = 2;
			if(this.onReady){
				this.onReady(ratio,delta);
			}
			 // we set this to 2 so we can fire this event once.
		}
	}
}



Studio.Stage.prototype.drawProgress = function(ctx) {
	ctx.setTransform( ctx.resolution1, 0, 0, ctx.resolution, 0, 0 );
	this.progressBar( ctx,Studio.progress );
	ctx.restore();
};

// default progress bar. overwire this to create your own.
Studio.Stage.prototype.progressBar = function(ctx,progress){
	ctx.fillStyle = 'rgba(255,255,255,.8)';
	ctx.fillRect((this.width-202)/2,(this.height-22)/2, 202, 22);
	ctx.fillStyle = 'rgba(0,0,0,1)';
	ctx.fillRect(2+(this.width-202)/2,2+(this.height-22)/2, progress * 198, 18);
};

