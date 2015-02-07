Studio.Stage.prototype.WEBGL = {

	type : 'webgl',

	antialias : false,
	premultipliedAlpha : false,
	stencil : true,

	getContext : function(){
		this.ctx = this.canvas.getContext('webgl', {
			antialias : this.WEBGL.antialias ,
			premultipliedAlpha : this.WEBGL.premultipliedAlpha ,
			stencil : this.WEBGL.stencil 
		});
	},

	init : function(gl){
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
	},

	prep : function(gl){
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
	},

	loop: function (delta){
		this.step(delta);
		this.fixedStep();
		this.renderGL(this.ctx,this._lag);
	}

}

Studio.Stage.prototype.renderGL = function(gl,lag){
	gl._count = 0;
	this.vertex_children(gl,lag);

	gl.bufferData(gl.ARRAY_BUFFER, gl._batch, gl.DYNAMIC_DRAW);
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	// gl.drawArrays(gl.TRIANGLES, 0, this.children.length*6);
	gl.drawElements(gl.TRIANGLES, stage.hasChildren*6, gl.UNSIGNED_SHORT, 0);  

}

