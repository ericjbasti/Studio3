var FRAGMENTSHADER = ['precision lowp float;',
						'uniform sampler2D u_image;',
						'varying vec4 v_color;',
						'varying vec2 v_texture;',
						'void main(void) {',
						'   if(v_texture.x==10.0){',
						'		gl_FragColor = v_color;',
						'	}else{',
						'		gl_FragColor = texture2D(u_image, v_texture) * v_color;',
						'	}',
						'}'].join('\n');

var VERTEXSHADER = ['attribute vec3 a_position;',
						'attribute vec4 a_color;',
						'attribute vec2 a_texture;',
						'uniform vec2 u_resolution;',
						'varying vec4 v_color;',
						'varying vec2 v_texture;',
						'void main(void) {',
						'	vec2 canvas_coords = ((vec2(a_position.x,a_position.y)/ u_resolution)*2.0) - 1.0;',
						'	gl_Position = vec4(canvas_coords * vec2(1.0,-1.0), a_position.z, 1.0);',
						'	v_color = a_color;',
						'	v_texture = a_texture;',
						'}'].join('\n');

Studio.Stage.prototype.loadShader = function(who, shader) {
	//var shaderScript = document.getElementById(shader);
	//var str = '';
	// var k = shaderScript.firstChild ;
	// while (k) {
	// 	if (k.nodeType == 3) {
	// 		str += k.textContent;
	// 	}
	// 	k = k.nextSibling;
	// }
	this.ctx.shaderSource(who, shader);
};

Studio.Stage.prototype.WEBGL = {

	type: 'webgl',

	antialias: false,
	premultipliedAlpha: false,
	stencil: true,

	getContext: function() {
		this.ctx = this.canvas.getContext('webgl', {
			antialias: this.WEBGL.antialias ,
			premultipliedAlpha: this.WEBGL.premultipliedAlpha ,
			stencil: this.WEBGL.stencil
		});
	},
	init: function(gl) {
		gl._count = 0;
		gl._batch = new Float32Array(16384 * 32);
		gl.clearColor(this.color.r, this.color.g, this.color.b, this.color.a);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
		this.loadShader(this.vertexShader , VERTEXSHADER);
		// gl.shaderSource(this.vertexShader,Studio.STANDARD_VERT_SHADER)
		gl.compileShader(this.vertexShader);

		this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		this.loadShader(this.fragmentShader , FRAGMENTSHADER);
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

		this.prepTexture = function(gl){
			this._texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, stage._texture );
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		}
		this.setTexture = function(image, mipmap){
			if(!this._texture) {
				this.prepTexture(this.ctx);
			}
			this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, image.image);
			if(mipmap){
				this.ctx.generateMipmap(this.ctx.TEXTURE_2D);
			}
		}
	},

	prep: function(gl) {
		gl.resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution');

		gl.enableVertexAttribArray(0);

		gl.positionLocation = gl.getAttribLocation(this.program, 'a_position');
		gl.bindAttribLocation(this.program, 0, 'a_position');

		gl.colorLocation = gl.getAttribLocation(this.program, 'a_color');
		// gl.bindAttribLocation(this.program, 2, 'a_color');

		gl.textureLocation = gl.getAttribLocation(this.program, 'a_texture');
		// gl.bindAttribLocation(this.program, 6, 'a_texture');

		gl.uniform2f(gl.resolutionLocation, this.width, this.height);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		gl.enableVertexAttribArray(gl.positionLocation);
		gl.enableVertexAttribArray(gl.colorLocation);
		gl.enableVertexAttribArray(gl.textureLocation);

		gl.vertexAttribPointer(gl.positionLocation, 2, gl.FLOAT, false, 32, 0);
		gl.vertexAttribPointer(gl.colorLocation, 4, gl.FLOAT, false, 32, 8);
		gl.vertexAttribPointer(gl.textureLocation, 2, gl.FLOAT, false, 32, 24);

		this._rect_index_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._rect_index_buffer);
		this._rect_index = new Uint16Array(this._maxCount * 6);

		for (var i = 0, j = 0; i < this._maxCount * 6; i += 6, j += 4) {
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
	render:  function(lag) {
		this.ctx._count = 0;
		this.vertex_children(this.ctx, lag, this.interpolate);
		this.ctx.bufferData(this.ctx.ARRAY_BUFFER, this.ctx._batch, this.ctx.DYNAMIC_DRAW);
		this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);
		// gl.drawArrays(gl.TRIANGLES, 0, this.children.length*6);
		this.ctx.drawElements(this.ctx.TRIANGLES, this.hasChildren * 6, this.ctx.UNSIGNED_SHORT, 0);

	}
};
